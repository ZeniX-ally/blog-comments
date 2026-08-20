"use client";

import { useEffect, useRef } from "react";

/**
 * Apple 风格全屏 100% 铺满斜上方 3D 流体网格波浪 (Full-bleed 100% Coverage 3D Wave Mesh)
 * - 彻底消除顶部、底部、左侧、右侧所有白色留白空间
 * - 摄像机视点 cy 置于 0.28 (偏上)，极远景 Z 从 -550 一路覆盖穿透顶部上方
 * - 纯 GPU 矢量渲染，60fps 丝滑轻盈
 */
export function InkParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || canvas);

    const ROWS = 42; // 深度行数
    const COLS = 48; // 横向列数

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const t = time * 0.0008;
      const isDark = document.documentElement.classList.contains("dark");

      // 摄像机视点向上提，使远景完全溢出并覆盖顶部边界
      const cx = width * 0.5;
      const cy = height * 0.22;

      // 俯瞰倾角
      const pitch = 0.52;
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const fov = 480;

      const grid: { sx: number; sy: number; alpha: number; depth: number }[][] = [];

      for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        const zNorm = r / (ROWS - 1); // 0 (近景下方) ~ 1 (远景上方)
        // 纵深向远端大幅推进至 -580 (远端穿透顶部)，近端拉至 +620 (近端穿透底部)
        const rawZ = -580 + zNorm * 1200;

        for (let c = 0; c < COLS; c++) {
          const xNorm = (c / (COLS - 1)) * 2 - 1; // -1 ~ 1
          // 横向大幅延展至 1.45 倍宽度，消除两侧任何留白
          const rawX = xNorm * (width * 1.45);

          // 3D 空间流体复合波高
          const w1 = Math.sin(rawX * 0.005 + t * 1.5 + rawZ * 0.004) * 35;
          const w2 = Math.cos(rawX * 0.0028 - t * 1.0 + rawZ * 0.006) * 25;
          const w3 = Math.sin((rawX + rawZ) * 0.0022 + t * 0.75) * 18;
          const rawY = 30 + (w1 + w2 + w3); // 3D 高度

          // 摄像机旋转变换 (绕 X 轴俯仰)
          const rotY = rawY * cosPitch - rawZ * sinPitch;
          const rotZ = rawY * sinPitch + rawZ * cosPitch + 500;

          // 3D 透视投影到 2D 屏幕
          const scale = fov / rotZ;
          const sx = cx + rawX * scale;
          const sy = cy + rotY * scale;

          // 全局饱满不透明度，无任何两端褪色
          const edgeFade = 1 - Math.pow(Math.abs(xNorm), 4) * 0.25;
          const depthFade = (0.4 + 0.6 * Math.sin(zNorm * Math.PI)) * edgeFade * (isDark ? 0.75 : 0.55);

          grid[r][c] = {
            sx,
            sy,
            alpha: depthFade,
            depth: zNorm,
          };
        }
      }

      // 1. 绘制横向 3D 俯瞰网格线 (从远向近渲染)
      for (let r = ROWS - 1; r >= 0; r--) {
        const rowAlpha = grid[r][0].alpha;
        if (rowAlpha <= 0.01) continue;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(grid[r][0].sx, grid[r][0].sy);

        for (let c = 1; c < COLS; c++) {
          const prev = grid[r][c - 1];
          const curr = grid[r][c];
          const mx = (prev.sx + curr.sx) * 0.5;
          const my = (prev.sy + curr.sy) * 0.5;
          ctx.quadraticCurveTo(prev.sx, prev.sy, mx, my);
        }
        ctx.lineTo(grid[r][COLS - 1].sx, grid[r][COLS - 1].sy);

        // Apple 鲜明发光多色温渐变
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);

        if (isDark) {
          lineGrad.addColorStop(0, `rgba(0, 205, 145, ${rowAlpha * 0.45})`);
          lineGrad.addColorStop(0.35, `rgba(30, 165, 255, ${rowAlpha * 1.35})`);
          lineGrad.addColorStop(0.7, `rgba(150, 95, 255, ${rowAlpha * 1.15})`);
          lineGrad.addColorStop(1, `rgba(230, 85, 205, ${rowAlpha * 0.45})`);
        } else {
          lineGrad.addColorStop(0, `rgba(0, 155, 115, ${rowAlpha * 0.38})`);
          lineGrad.addColorStop(0.35, `rgba(0, 140, 235, ${rowAlpha * 1.15})`);
          lineGrad.addColorStop(0.7, `rgba(125, 65, 215, ${rowAlpha * 0.95})`);
          lineGrad.addColorStop(1, `rgba(195, 55, 155, ${rowAlpha * 0.35})`);
        }

        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = Math.max(1.15, (1.85 - grid[r][0].depth * 0.8));
        ctx.stroke();
        ctx.restore();
      }

      // 2. 绘制纵向 3D 经线 (隔列透视线，上下彻底拉满)
      for (let c = 0; c < COLS; c += 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(grid[0][c].sx, grid[0][c].sy);

        for (let r = 1; r < ROWS; r++) {
          const prev = grid[r - 1][c];
          const curr = grid[r][c];
          const mx = (prev.sx + curr.sx) * 0.5;
          const my = (prev.sy + curr.sy) * 0.5;
          ctx.quadraticCurveTo(prev.sx, prev.sy, mx, my);
        }
        ctx.lineTo(grid[ROWS - 1][c].sx, grid[ROWS - 1][c].sy);

        const colAlpha = isDark ? 0.15 : 0.1;
        ctx.strokeStyle = isDark
          ? `rgba(30, 165, 255, ${colAlpha})`
          : `rgba(0, 140, 235, ${colAlpha})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
