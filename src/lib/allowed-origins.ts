/**
 * 允许调用本站服务端接口的页面来源白名单。
 * 申请表提交（/api/gongyi/apply）与埋点代理（/api/event）共用同一份。
 *
 * 浏览器按页面自身 origin 发送 Origin，别的站点无法冒用，不削弱跨站防护。
 * 只被 Functions 使用（Node 测试加载不了这里的 JSON 导入），判断逻辑本身在 src/lib/apply.ts。
 */
import { isAllowedOrigin } from "./apply";
import siteCore from "./site-core.json";

export const SITE_ORIGIN = String(siteCore.url).replace(/\/$/, "");

export const ALLOWED_ORIGINS = [
  SITE_ORIGIN,
  // Cloudflare 控制台与构建输出交给用户的 pages.dev 主机名，页面也会从这里打开。
  "https://0xff-blog.pages.dev",
  /** 本地 `wrangler pages dev` 的默认端口也要放行 */
  "http://localhost:8788",
  "http://127.0.0.1:8788",
];

export function isOriginAllowed(origin: string | null): boolean {
  return isAllowedOrigin(origin, ALLOWED_ORIGINS);
}
