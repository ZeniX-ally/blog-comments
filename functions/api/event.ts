/**
 * Plausible 事件代理（/api/event）：转发到上游，成功失败一律回 202，埋点绝不影响页面主流程。
 * `/api/*` 已在 out/_routes.json 的 include 里，无需额外配置。
 */
import { handleEventProxy } from "../../src/lib/analytics-proxy";
import { isOriginAllowed } from "../../src/lib/allowed-origins";

export async function onRequest(context: { request: Request }): Promise<Response> {
  return handleEventProxy(context.request, isOriginAllowed);
}
