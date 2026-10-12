/**
 * Umami 事件埋点：脚本没加载、被网络拦截、或字段不合法时静默跳过，绝不抛错。
 * 脚本与事件端点都在自托管实例上（见 src/lib/site.ts 的 umami 配置），不再依赖第三方统计域名。
 */
type TrackData = Record<string, string | number | boolean>;

type Umami = { track?: (event: string, data?: TrackData) => void };

export function track(event: string, data?: TrackData): void {
  if (typeof window === "undefined") return;
  try {
    (window as unknown as { umami?: Umami }).umami?.track?.(event, data);
  } catch {
    /* 埋点失败不影响主流程 */
  }
}
