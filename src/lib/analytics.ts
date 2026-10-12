/**
 * Plausible 事件埋点：脚本没加载、被网络拦截、或字段不合法时静默跳过，绝不抛错。
 * 脚本与事件端点都走本站域名（/js/script.js、/api/event），代理实现在 src/lib/analytics-proxy.ts。
 */
type TrackData = Record<string, string | number | boolean>;

type Plausible = (event: string, options?: { props?: TrackData }) => void;

export function track(event: string, data?: TrackData): void {
  if (typeof window === "undefined") return;
  try {
    (window as unknown as { plausible?: Plausible }).plausible?.(event, data ? { props: data } : undefined);
  } catch {
    /* 埋点失败不影响主流程 */
  }
}
