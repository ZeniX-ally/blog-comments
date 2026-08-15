"use client";

import { useEffect } from "react";

/**
 * 点击水面涟漪(visualization-collection RippleFloatOnTheWater 轻量版)。
 * - 任意位置点击生成 2 圈同心涟漪环缓慢扩散渐隐(浅色细环)
 * - WAAPI 驱动,动画结束自动清理;reduced-motion 时仅保留单环
 */
export function RippleFx() {
  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onPointerDown = (e: PointerEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;
      const host = document.createElement("div");
      host.style.cssText =
        "position:fixed;left:0;top:0;width:0;height:0;z-index:9999;pointer-events:none;";
      document.body.appendChild(host);

      const makeRing = (delay: number, size: number) => {
        const ring = document.createElement("div");
        ring.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;border:1.5px solid rgba(29,29,31,0.35);`;
        host.appendChild(ring);
        const anim = ring.animate(
          [
            { transform: "scale(0.2)", opacity: 0.7 },
            { transform: "scale(1)", opacity: 0 },
          ],
          {
            duration: reduced ? 400 : 900,
            delay,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "both",
          },
        );
        anim.onfinish = () => ring.remove();
        return anim.finished;
      };

      // 两圈错开扩散
      const fin1 = makeRing(0, 56);
      const fin2 = reduced ? Promise.resolve() : makeRing(120, 44);
      Promise.all([fin1, fin2]).then(() => host.remove());
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
