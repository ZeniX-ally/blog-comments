/**
 * 邀请码申请接口。静态站是 output: "export"，这是整个项目唯一的服务端代码。
 * 部署：仓库根 `functions/` 由 `wrangler pages deploy out` 自动带上；
 * `out/_routes.json` 把 Function 限定在 /api/*，静态页面不触发 Function。
 * 本目录被 tsconfig 的 exclude 排除，所以这里自带最小类型声明，不依赖 @cloudflare/workers-types。
 */
import {
  BODY_MAX,
  DEDUPE_WINDOW_SEC,
  RATE_WINDOW_SEC,
  isRateLimited,
  isSpam,
  parseApplyPayload,
  sha256Hex,
  telegramText,
} from "../../../src/lib/apply";
import { isOriginAllowed } from "../../../src/lib/allowed-origins";

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type Env = {
  GONGYI_KV?: KVNamespaceLike;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

type Ctx = {
  request: Request & { cf?: { country?: string } };
  env: Env;
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

export async function onRequest(context: Ctx): Promise<Response> {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "POST" });
  }
  if (!isOriginAllowed(request.headers.get("Origin"))) {
    return json({ ok: false, error: "bad_origin" }, 403);
  }

  // content-length 粗筛：先兜住超大请求再读 body（阈值 4 倍是 UTF-8 最坏情况余量）
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > BODY_MAX * 4) {
    return json({ ok: false, error: "body_too_large" }, 400);
  }

  const body = await request.text();
  // 后备：content-length 可能缺失或低报；它按字节计，而 BODY_MAX 按 UTF-16 code unit 计
  if (body.length > BODY_MAX) return json({ ok: false, error: "body_too_large" }, 400);

  const kv = env.GONGYI_KV;
  const ip = request.headers.get("CF-Connecting-IP") || "Unknown";

  // 限流：先计数再判定，被蜜罐拦下的刷子也要计入次数
  let count = 0;
  if (kv) {
    try {
      const key = `rl:${ip}`;
      count = Number((await kv.get(key)) ?? "0") || 0;
      await kv.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_SEC });
    } catch {
      count = 0; // KV 故障降级放行
    }
  }
  if (isRateLimited(count)) return json({ ok: false, error: "rate_limited" }, 429);

  const parsed = parseApplyPayload(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const { email, luser, reason, source, ref, hp, elapsed } = parsed.payload;

  // 蜜罐 / 时序命中：对外一律成功，不发通知，不给刷子任何反馈
  if (isSpam({ hp, elapsed })) return json({ ok: true }, 200);

  // 去重「查询」：命中同样返回成功。这里只读不写：写标记推迟到推送成功之后，
  // 否则推送失败（如未配置凭据）会让申请人第一次尝试就烧掉 24h 窗口，静默丢申请。
  let dedupeKey = "";
  if (kv) {
    try {
      dedupeKey = `em:${await sha256Hex(email)}`;
    } catch {
      /* 哈希计算失败：留空键，跳过去重读写，继续走通知，绝不 500 */
    }
  }
  if (kv && dedupeKey) {
    try {
      if (await kv.get(dedupeKey)) return json({ ok: true }, 200);
    } catch {
      /* KV 读失败降级放行 */
    }
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("gongyi_notify_missing_credentials");
    return json({ ok: false, error: "notify_failed" }, 502);
  }

  const text = telegramText({ email, luser, reason, source, ref, country: request.cf?.country ?? "" });

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      // 读 Telegram 的错误描述便于诊断；不含 token，也不含申请人数据
      const detail = await res.text().catch(() => "");
      console.error("gongyi_notify_failed", res.status, detail.slice(0, 200));
      return json({ ok: false, error: "notify_failed" }, 502);
    }
  } catch {
    // 只记固定串，绝不记异常文本（可能含 token 的请求 URL）
    console.error("gongyi_notify_threw");
    return json({ ok: false, error: "notify_failed" }, 502);
  }

  // 推送成功才写去重标记
  if (kv && dedupeKey) {
    try {
      await kv.put(dedupeKey, "1", { expirationTtl: DEDUPE_WINDOW_SEC });
    } catch {
      /* KV 写失败降级 */
    }
  }

  return json({ ok: true }, 200);
}
