import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * 首页 hero 背景循环动画(0xff 粒子流)。
 * - 10s / 30fps / 1920x1080,无缝循环(所有运动周期 = 整数圈)
 * - 绿主色粒子沿椭圆弧线漂移,点缀蓝/紫/黄短线;hex 字符缓慢浮动;中心绿光呼吸
 * - 低透明度装饰层,渲染为 WebM 后作为首页 hero 背景视频
 */

const DURATION_FRAMES = 300; // 10s @ 30fps

const COLORS: [string, number][] = [
  ["0,255,156", 0.6],
  ["125,211,255", 0.15],
  ["196,181,253", 0.15],
  ["255,209,102", 0.1],
];

const HEX_STRS = [
  "0xFF", "0x1A", "0x0A", "0xDE", "0xAD", "0xBE", "0xEF", "0x00",
  "0x2A", "0xC0", "0x7F", "0xE5", "0x3C", "0x9F", "0xB4", "0x5A",
];

/** 确定性伪随机(mulberry32,种子 0xFF),保证 SSR/渲染一致 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(0xff);

function pickColor(): string {
  let a = rnd();
  for (const [c, w] of COLORS) {
    if (a < w) return c;
    a -= w;
  }
  return COLORS[0][0];
}

type Particle = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  orbits: number;
  phase: number;
  size: number;
  alpha: number;
  color: string;
  wave: number;
  isDash: boolean;
};

function buildParticles(): Particle[] {
  return Array.from({ length: 150 }, (_, i) => ({
    cx: 0.08 + rnd() * 0.84,
    cy: 0.08 + rnd() * 0.84,
    rx: 0.02 + rnd() * 0.14,
    ry: 0.03 + rnd() * 0.17,
    orbits: 1 + Math.floor(rnd() * 3),
    phase: rnd() * Math.PI * 2,
    size: 1 + rnd() * 2.5,
    alpha: 0.1 + rnd() * 0.3,
    color: pickColor(),
    wave: 2 + rnd() * 10,
    isDash: i % 3 === 0,
  }));
}

const PARTICLES = buildParticles();

type HexChar = {
  x: number;
  y0: number;
  amp: number;
  phase: number;
  size: number;
  alpha: number;
  text: string;
  orbits: number;
};

function buildHexChars(): HexChar[] {
  return Array.from({ length: 16 }, () => ({
    x: 0.05 + rnd() * 0.9,
    y0: 0.06 + rnd() * 0.88,
    amp: 0.02 + rnd() * 0.06,
    phase: rnd() * Math.PI * 2,
    size: 13 + rnd() * 15,
    alpha: 0.05 + rnd() * 0.1,
    text: HEX_STRS[Math.floor(rnd() * HEX_STRS.length)],
    orbits: 1 + Math.floor(rnd() * 2),
  }));
}

const HEX_CHARS = buildHexChars();

export const HeroBg: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1

  // 中心光晕呼吸:2 个整数周期(循环无缝)
  const glow = 0.08 + 0.05 * Math.sin(t * Math.PI * 4);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0c" }}>
      {/* 中心光晕 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 42%, rgba(0,255,156,${glow}) 0%, rgba(0,255,156,${glow * 0.4}) 30%, transparent 70%)`,
        }}
      />

      {/* 粒子流:椭圆轨道 + 波浪扰动(整数圈,循环无缝) */}
      {PARTICLES.map((p, i) => {
        const theta = t * Math.PI * 2 * p.orbits + p.phase;
        const x = (p.cx + p.rx * Math.cos(theta)) * width;
        const y =
          (p.cy +
            p.ry * Math.sin(theta) +
            Math.sin(theta * 2 + p.phase) * p.wave * 0.01) *
          height;
        if (p.isDash) {
          const len = 6 + (i % 5) * 3;
          const ang =
            (Math.atan2(p.ry * Math.cos(theta), -p.rx * Math.sin(theta)) *
              180) /
            Math.PI;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: len,
                height: 1.5,
                background: `rgba(${p.color},${p.alpha})`,
                transform: `rotate(${ang}deg)`,
                transformOrigin: "left center",
              }}
            />
          );
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - p.size / 2,
              top: y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `rgba(${p.color},${p.alpha})`,
            }}
          />
        );
      })}

      {/* hex 字符:缓慢浮动 */}
      {HEX_CHARS.map((c, i) => {
        const ph = t * Math.PI * 2 * c.orbits + c.phase;
        const x = c.x * width;
        const y = (c.y0 + Math.sin(ph) * c.amp) * height;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: "ui-monospace, monospace",
              fontSize: c.size,
              color: `rgba(0,255,156,${c.alpha})`,
              transform: "translateX(-50%)",
            }}
          >
            {c.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export { DURATION_FRAMES };
