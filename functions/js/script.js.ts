/**
 * Plausible 脚本代理（/js/script.js）。上游固定在 src/lib/analytics-proxy.ts，不接受任何参数。
 * 部署：`wrangler pages deploy out` 自动带上；`out/_routes.json` 的 include 需含 /js/script.js。
 */
import { handleScriptProxy } from "../../src/lib/analytics-proxy";

export async function onRequest(context: { request: Request }): Promise<Response> {
  return handleScriptProxy(context.request);
}
