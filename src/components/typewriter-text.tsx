"use client";

import { useTypewriter } from "@/hooks/use-typewriter";
import { sfxKey } from "@/lib/sound";

/**
 * 打字机标题:逐字打出 + 闪烁光标,点击立即显示全文。
 * - reduced-motion 时直接显示全文(useTypewriter 内部处理)
 * - 敲键声走 sfxKey,音效未开启时无副作用
 */
export function TypewriterText({
  text,
  className = "",
  speed = 45,
  startDelay = 0,
  caret = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  caret?: boolean;
}) {
  const { shown, done, skip } = useTypewriter(text, {
    speed,
    startDelay,
    onKey: () => sfxKey(),
  });

  return (
    <span
      className={className}
      onClick={skip}
      role="text"
      aria-label={text}
      title="点击跳过打字机"
    >
      {shown}
      {caret && !done && (
        <span aria-hidden="true" className="cursor-blink">
          ▍
        </span>
      )}
    </span>
  );
}
