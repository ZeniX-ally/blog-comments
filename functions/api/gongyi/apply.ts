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
  isAllowedOrigin,
  isRateLimited,
  isSpam,
  parseApplyPayload,
  sha256Hex,
  telegramText,
} from "../../../src/lib/apply";
import siteCore from "../../../src/lib/site-core.json";

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

const SITE_ORIGIN = String(siteCore.url).replace(/\/$/, "");
/** 本地 `wrangler pages dev` 的默认端口也要放行 */
const ALLOWED_ORIGINS = [SITE_ORIGIN, "http://localhost:8788", "http://127.0.0.1:8788"];

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
  if (!isAllowedOrigin(request.headers.get("Origin"), ALLOWED_ORIGINS)) {
    return json({ ok: false, error: "bad_origin" }, 403);
  }

  const body = await request.text();
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
  const { email, source, ref, hp, elapsed } = parsed.payload;

  // 蜜罐 / 时序命中：对外一律成功，不发通知，不给刷子任何反馈
  if (isSpam({ hp, elapsed })) return json({ ok: true }, 200);

  // 去重：命中同样返回成功
  if (kv) {
    try {
      const key = `em:${await sha256Hex(email)}`;
      if (await kv.get(key)) return json({ ok: true }, 200);
      await kv.put(key, "1", { expirationTtl: DEDUPE_WINDOW_SEC });
    } catch {
      /* 降级继续 */
    }
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return json({ ok: false, error: "notify_failed" }, 502);

  const text = telegramText({ email, source, ref, country: request.cf?.country ?? "" });

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) return json({ ok: false, error: "notify_failed" }, 502);
  } catch {
    return json({ ok: false, error: "notify_failed" }, 502);
  }

  return json({ ok: true }, 200);
}
