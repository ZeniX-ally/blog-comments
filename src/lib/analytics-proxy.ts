/**
 * Plausible 代理：脚本与事件端点都从本站域名（/js/script.js、/api/event）转发，
 * 这样访客浏览器只跟自己域名通信——第三方统计域名被网络阻断或被拦截器拦掉时依然能采到数据。
 *
 * 本模块刻意不 import 任何东西：Node 的 --experimental-strip-types 要求相对导入带扩展名，
 * 零依赖才能被 tests/analytics.test.mjs 直接加载；来源策略由调用方注入。
 */
export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/** 是否放行该页面的请求；默认一律不放行（接线失误时失败在"丢弃"这一侧） */
export type OriginPolicy = (origin: string | null) => boolean;

const denyAll: OriginPolicy = () => false;

/** 带自定义属性（事件里的 source/reason）需要 tagged-events 版本 */
export const PLAUSIBLE_SCRIPT_URL = "https://plausible.io/js/script.tagged-events.js";
export const PLAUSIBLE_EVENT_URL = "https://plausible.io/api/event";

/** 事件 body 上限：Plausible 正常载荷 1KB 以内，超过的一律丢弃 */
export const EVENT_BODY_MAX = 4096;

/** 脚本体积上限与浏览器缓存时长 */
const SCRIPT_MAX = 131072;
const SCRIPT_CACHE_SEC = 3600;

/** 埋点接口对浏览器永远是 202：成功、被丢弃、上游失败一个样，不给探测者反馈 */
function accepted(): Response {
  return new Response(null, { status: 202, headers: { "cache-control": "no-store" } });
}

function scriptUnavailable(): Response {
  return new Response(null, { status: 502, headers: { "cache-control": "no-store" } });
}

/** POST /api/event → https://plausible.io/api/event */
export async function handleEventProxy(
  request: Request,
  isAllowedOrigin: OriginPolicy = denyAll,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }
  // 只放行本站页面的提交；其余静默丢弃，别人无法往账号里灌假事件
  if (!isAllowedOrigin(request.headers.get("origin"))) return accepted();

  const body = await request.text();
  if (!body || body.length > EVENT_BODY_MAX) return accepted();

  const headers: Record<string, string> = { "content-type": "application/json" };
  const ua = request.headers.get("user-agent");
  if (ua) headers["user-agent"] = ua;
  // Plausible 用来源 IP 做地理位置，转发给上游
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) headers["x-forwarded-for"] = ip;

  try {
    await fetcher(PLAUSIBLE_EVENT_URL, { method: "POST", headers, body });
  } catch {
    /* 埋点失败绝不影响页面 */
  }
  return accepted();
}

/** GET/HEAD /js/script.js → https://plausible.io/js/script.tagged-events.js */
export async function handleScriptProxy(request: Request, fetcher: Fetcher = fetch): Promise<Response> {
  const { method } = request;
  if (method !== "GET" && method !== "HEAD") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  }

  try {
    const res = await fetcher(PLAUSIBLE_SCRIPT_URL, {
      headers: { accept: "application/javascript, text/javascript;q=0.9, */*;q=0.8" },
    });
    if (!res.ok) return scriptUnavailable();

    const body = await res.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > SCRIPT_MAX) return scriptUnavailable();

    return new Response(method === "HEAD" ? null : body, {
      status: 200,
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": `public, max-age=${SCRIPT_CACHE_SEC}`,
      },
    });
  } catch {
    return scriptUnavailable();
  }
}
