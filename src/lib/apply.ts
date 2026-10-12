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
/** L站用户 ID 长度上限（linux.do 用户名 / 数字 ID） */
export const LUSER_MAX = 32;
/** 申请原因长度区间（字），两侧都是闭区间 */
export const REASON_MIN = 10;
export const REASON_MAX = 300;
/** 请求体上限（字符数）：三个字段加上 JSON 结构开销 */
export const BODY_MAX = 2048;

export type Attribution = {
  /** 形如 v2ex 或 v2ex:launch；空串表示直接访问 */
  source: string;
  /** 来源页 host；空串表示同域或没有 referrer */
  ref: string;
};

export type ApplyPayload = {
  email: string;
  /** linux.do 用户名或数字 ID，已归一化 */
  luser: string;
  /** 申请原因，已 trim */
  reason: string;
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

/**
 * L站用户 ID 归一化。用户常直接粘贴 linux.do 主页链接，这里尽量把链接里的
 * 用户名抠出来（顺带去掉结尾 .json），省得让他们自己删。
 * 除此之外原样返回：大小写与字符都不动，非法值交给 isValidLuser 拒绝。
 */
export function normalizeLuser(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let value = raw.trim();
  if (value.startsWith("@")) value = value.slice(1);
  // 匹配 .../u/<name>（可带结尾 .json）；前缀与协议可有可无
  const match = value.match(/(?:^|\/)u\/([^/?#]+?)(?:\.json)?\/?$/);
  if (match) return match[1];
  return value;
}

/**
 * L站用户 ID 校验：先归一化再按字符白名单与长度上限判定。
 * 额外要求至少含一个字母或数字，挡住 ".." / "--" 这类纯符号的怪值。
 */
export function isValidLuser(raw: unknown): boolean {
  const value = normalizeLuser(raw);
  if (!new RegExp(`^[A-Za-z0-9._-]{2,${LUSER_MAX}}$`).test(value)) return false;
  // 至少一个字母或数字，挡住 ".." / "--" 这类纯符号
  return /[A-Za-z0-9]/.test(value);
}

/** 申请原因校验：字符串、trim 后长度落在 [REASON_MIN, REASON_MAX] */
export function isValidReason(raw: unknown): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim();
  return value.length >= REASON_MIN && value.length <= REASON_MAX;
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
  if (!isValidLuser(row.luser)) return { ok: false, error: "invalid_luser" };
  if (!isValidReason(row.reason)) return { ok: false, error: "invalid_reason" };
  // 勾选框必须显式为 true，否则视为没同意规则
  if (row.agree !== true) return { ok: false, error: "must_agree" };
  const elapsed =
    typeof row.elapsed === "number" && Number.isFinite(row.elapsed) ? row.elapsed : null;
  return {
    ok: true,
    payload: {
      email: normalizeEmail(String(row.email)),
      luser: normalizeLuser(row.luser),
      reason: String(row.reason).trim(),
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
  luser?: string;
  reason?: string;
  source?: string;
  ref?: string;
  country?: string;
  now?: Date;
}): string {
  // L站ID 与申请原因即使为空也固定占位：通知里字段顺序与位置保持稳定，
  // 一眼能看出「这一条缺了内容」，而不是靠缺行去猜（来源/Referrer 则按既有约定省略空行）。
  const lines = [
    "新的邀请码申请",
    `邮箱: ${input.email}`,
    `L站ID: ${input.luser ?? ""}`,
    "申请原因:",
    input.reason ?? "",
  ];
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
