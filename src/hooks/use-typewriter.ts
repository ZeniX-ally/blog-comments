"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 打字机 hook:文本逐字打出,终端沉浸感核心。
 * - 点击容器立即显示全文(中断动画)
 * - prefers-reduced-motion 时直接显示全文
 * - 可选 onKey:每打一个字回调一次(用于敲键音效)
 * - 光标用独立的 CSS 动画(cursor-blink),由调用方渲染
 */
export function useTypewriter(
  text: string,
  opts?: { speed?: number; startDelay?: number; onKey?: () => void },
) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const doneRef = useRef(false);

  // 敲键音效回调:可空,EffectLayer 注入
  const onKeyRef = useRef(opts?.onKey);
  onKeyRef.current = opts?.onKey;

  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    const full = textRef.current;
    if (full.length === 0) {
      setDone(true);
      doneRef.current = true;
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCount(full.length);
      setDone(true);
      doneRef.current = true;
      return;
    }

    // 时间轴:用 timestamp 累积,比固定 setTimeout 更稳,系统卡顿时不堆积
    const speed = opts?.speed ?? 45; // ms/字
    const startDelay = opts?.startDelay ?? 0;
    let startAt = 0;
    let typed = 0;

    const tick = (ts: number) => {
      if (startAt === 0) startAt = ts + startDelay;
      const elapsed = ts - startAt;
      const next = Math.floor(elapsed / speed);
      if (next > typed && next <= full.length) {
        typed = next;
        setCount(typed);
        onKeyRef.current?.();
      }
      if (typed >= full.length) {
        setDone(true);
        doneRef.current = true;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 点击跳过:立即显示全文
  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setCount(textRef.current.length);
    setDone(true);
    cancelAnimationFrame(raf.current);
  };

  const shown = useMemo(() => text.slice(0, count), [text, count]);

  return { shown, done, skip };
}
