/**
 * 邀请码申请：纯逻辑。
 * 客户端、Pages Function、node:test 三方共用，所以这里不允许任何运行时 import
 * （零 node / Next / JSON 依赖，才能被 Worker 打包、被浏览器打包、被 node --test 直接加载）。
 */

/** 接口路径（客户端与 Function 路由共用同一份字面量） */
export const APPLY_PATH = "/api/gongyi/apply";

/** Umami 事件名 */
export const EVENT_CTA = "gongyi_cta_click";
export const EVENT_SUBMIT = "gongyi_apply_submit";
export const EVENT_SUCCESS = "gongyi_apply_success";
export const EVENT_ERROR = "gongyi_apply_error";

/** 邮箱长度上限（RFC 5321 实践上限） */
export const EMAIL_MAX = 254;
/** 来源 / referrer 串长度上限 */
export const SOURCE_MAX = 64;
/** 表单最短停留；低于此值视为脚本（毫秒） */
export const MIN_ELAPSED_MS = 3000;
/** 同 IP 每小时申请上限 */
export const RATE_LIMIT = 3;
/** 限流窗口（秒），同时是 KV 的 expirationTtl */
export const RATE_WINDOW_SEC = 3600;
/** 同邮箱去重窗口（秒） */
export const DEDUPE_WINDOW_SEC = 86400;
/** 请求体上限（字符数） */
export const BODY_MAX = 1024;

export type Attribution = {
  /** 形如 v2ex 或 v2ex:launch；空串表示直接访问 */
  source: string;
  /** 来源页 host；空串表示同域或没有 referrer */
  ref: string;
};

export type ApplyPayload = {
  email: string;
  source: string;
  ref: string;
  hp: string;
  /** null 表示客户端没给有效值，跳过时序判定 */
  elapsed: number | null;
};

/** 邮箱校验：单 @、两端非空、域名带点、无空白与换行、总长 ≤254 */
export function isValidEmail(raw: unknown): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim();
  if (value.length === 0 || value.length > EMAIL_MAX) return false;
  if (/[\s\r\n]/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (!domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  return true;
}

/** 去重用的规范化邮箱 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** 来源串：小写 + 白名单 [a-z0-9._:-] + 截断 64 */
export function normalizeSource(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9._:-]/g, "")
    .slice(0, SOURCE_MAX);
}

/** referrer 归一化为 host：接受完整 URL 或裸 host，同样走白名单 */
export function normalizeRef(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let value = raw.trim().toLowerCase();
  if (value.length === 0) return "";
  try {
    value = new URL(value).host;
  } catch {
    /* 不是完整 URL 就按 host 原样处理 */
  }
  return value.replace(/[^a-z0-9.:-]/g, "").slice(0, SOURCE_MAX);
}

/** host 是否属于本站（同域 referrer 不算获客来源） */
export function isSelfHost(host: string, selfHost: string): boolean {
  if (!host || !selfHost) return false;
  return host === selfHost || host.endsWith(`.${selfHost}`);
}

/**
 * 组装本次落地看到的来源（纯函数，不碰存储）。
 * UTM 优先；没有 UTM 时用 referrer host 兜底；同域 referrer 视为没有。
 */
export function deriveAttribution(input: {
  search: string;
  referrer: string;
  selfHost: string;
}): Attribution {
  const params = new URLSearchParams(input.search || "");
  const source = normalizeSource(params.get("utm_source") ?? "");
  const campaign = normalizeSource(params.get("utm_campaign") ?? "");
  const ref = normalizeRef(input.referrer);
  return {
    source: source ? (campaign ? `${source}:${campaign}` : source) : "",
    ref: isSelfHost(ref, input.selfHost) ? "" : ref,
  };
}

/** 蜜罐 / 时序：命中即静默丢弃（对外仍返回成功） */
export function isSpam(input: { hp?: unknown; elapsed?: number | null }): boolean {
  if (typeof input.hp === "string" && input.hp.trim().length > 0) return true;
  const elapsed = input.elapsed;
  if (
    typeof elapsed === "number" &&
    Number.isFinite(elapsed) &&
    elapsed >= 0 &&
    elapsed < MIN_ELAPSED_MS
  ) {
    return true;
  }
  return false;
}

/** 限流判定：count 是「本次之前」的计数 */
export function isRateLimited(count: number, limit: number = RATE_LIMIT): boolean {
  return count >= limit;
}

export type ParseResult =
  | { ok: true; payload: ApplyPayload }
  | { ok: false; error: string };

/** 解析并校验请求体；hp / elapsed 缺失一律降级为安全默认值，不单独报错 */
export function parseApplyPayload(body: string): ParseResult {
  if (body.length > BODY_MAX) return { ok: false, error: "body_too_large" };
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return { ok: false, error: "bad_json" };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "bad_json" };
  }
  const row = data as Record<string, unknown>;
  if (!isValidEmail(row.email)) return { ok: false, error: "invalid_email" };
  const elapsed =
    typeof row.elapsed === "number" && Number.isFinite(row.elapsed) ? row.elapsed : null;
  return {
    ok: true,
    payload: {
      email: normalizeEmail(String(row.email)),
      source: normalizeSource(row.source),
      ref: normalizeRef(row.ref),
      hp: typeof row.hp === "string" ? row.hp : "",
      elapsed,
    },
  };
}

/** 邮箱哈希（去重 key，不落明文） */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Telegram 通知文案（纯文本，不用 parse_mode，避免转义问题） */
export function telegramText(input: {
  email: string;
  source?: string;
  ref?: string;
  country?: string;
  now?: Date;
}): string {
  const lines = ["新的邀请码申请", `邮箱: ${input.email}`];
  if (input.source) lines.push(`来源: ${input.source}`);
  if (input.ref) lines.push(`Referrer: ${input.ref}`);
  const stamp = (input.now ?? new Date()).toISOString().replace("T", " ").slice(0, 16);
  lines.push(`地区: ${input.country || "??"} · ${stamp} UTC`);
  return lines.join("\n");
}

/** Origin 白名单判定（名单由调用方给，Function 侧从 site-core.json 组装） */
export function isAllowedOrigin(origin: string | null, allowed: string[]): boolean {
  if (!origin) return false;
  return allowed.includes(origin.replace(/\/$/, ""));
}
