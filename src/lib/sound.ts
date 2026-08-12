/**
 * 终端音效:WebAudio 振荡器合成敲键/回车声,零音频文件。
 * - 默认关闭(localStorage 记忆);开关需用户手势(点击)创建 AudioContext
 * - 所有播放函数内部判 enabled,未开启时全部 no-op,无副作用
 */

const KEY = "blog:sfx";

let enabled =
  typeof window !== "undefined" &&
  localStorage.getItem(KEY) === "1";

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isSfxEnabled(): boolean {
  return enabled;
}

export function setSfxEnabled(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* 存储不可用则本次会话有效 */
  }
  if (on) ensureCtx();
}

function blip(freq: number, dur = 0.04, type: OscillatorType = "square") {
  if (!enabled || typeof window === "undefined") return;
  try {
    const c = ensureCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.015, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {
    /* 音频不可用时静默忽略 */
  }
}

/** 打字机敲键声:随机音高,像机械键盘 */
export function sfxKey() {
  blip(620 + Math.random() * 380, 0.03);
}

/** 回车/命令执行声:双音提示 */
export function sfxEnter() {
  blip(300, 0.08, "triangle");
  setTimeout(() => blip(480, 0.1, "triangle"), 70);
}
