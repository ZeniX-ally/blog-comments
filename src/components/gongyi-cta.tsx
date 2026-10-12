"use client";

import { EVENT_CTA } from "@/lib/apply";
import { track } from "@/lib/analytics";
import { captureAttribution } from "@/lib/capture";

/**
 * 页头的「申请邀请码」锚点按钮。
 * 它是普通 <a href="#apply">，没有 JS 也能滚到表单；埋点只是附加行为。
 */
export function GongyiCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="pill"
      href={href}
      onClick={() => {
        const attribution = captureAttribution();
        track(EVENT_CTA, { source: attribution.source });
      }}
    >
      {label} <span className="arrow">→</span>
    </a>
  );
}
