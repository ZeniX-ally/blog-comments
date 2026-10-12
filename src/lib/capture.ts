/**
 * 浏览器侧取「本次落地的来源」：UTM 优先、referrer 兜底、first touch 保留 30 天。
 * 只在客户端调用（引用了 window / document）。
 */
import { deriveAttribution, type Attribution } from "@/lib/apply";
import { rememberAttribution } from "@/lib/attribution";

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return { source: "", ref: "" };
  return rememberAttribution(
    deriveAttribution({
      search: window.location.search,
      referrer: document.referrer,
      selfHost: window.location.host,
    }),
  );
}
