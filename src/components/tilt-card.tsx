"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

/**
 * 3D 倾斜卡片:悬停时卡片绕 X/Y 轴跟随鼠标轻微倾斜(默认 ±5°),
 * 表面暖光斑跟随鼠标位置;移出后 0.4s 平滑回正。
 * - 全程只写 CSS 变量(--tilt-x/--tilt-y/--spot-x/--spot-y)和 transform,不触发布局;
 * - mousemove 经 rAF 节流,移出时取消防抖并复位;
 * - prefers-reduced-motion 时退化为普通容器,无任何特效。
 */
export function TiltCard({
  className = "",
  children,
  maxTilt = 5,
}: {
  className?: string;
  children: ReactNode;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const target = useRef({ x: 0, y: 0, sx: 50, sy: 50 });
  const [hovering, setHovering] = useState(false);
  // 初始 false 与 SSR 输出一致,避免水合不一致
  const [motionOK, setMotionOK] = useState(false);

  useEffect(() => {
    setMotionOK(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const apply = () => {
    raf.current = 0;
    const el = ref.current;
    if (!el) return;
    const t = target.current;
    el.style.setProperty("--tilt-x", `${t.x.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${t.y.toFixed(2)}deg`);
    el.style.setProperty("--spot-x", `${t.sx.toFixed(2)}%`);
    el.style.setProperty("--spot-y", `${t.sy.toFixed(2)}%`);
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // 鼠标位置归一化到 0..1,向鼠标方向倾斜(跟手感)
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    target.current = {
      x: (0.5 - py) * 2 * maxTilt,
      y: (px - 0.5) * 2 * maxTilt,
      sx: px * 100,
      sy: py * 100,
    };
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  };

  const onLeave = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
    setHovering(false);
    const el = ref.current;
    if (!el) return;
    // 变量归零后由 .tilt-card 的 400ms 过渡平滑回正
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--spot-x", "50%");
    el.style.setProperty("--spot-y", "50%");
  };

  if (!motionOK) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      className={`tilt-card${hovering ? " is-hovering" : ""}${className ? ` ${className}` : ""}`}
      style={{
        transform:
          "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="tilt-card-inner">{children}</div>
      <div className="tilt-card-spot" aria-hidden="true" />
    </div>
  );
}
