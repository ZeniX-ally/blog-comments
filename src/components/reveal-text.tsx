"use client";

/**
 * 标题逐字浮现:载入时每个字依次淡入上移(60ms 间隔,总时长克制)。
 * 纯 CSS animation(both 填充),reduced-motion 时直接显示。
 */
export function RevealText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const chars = Array.from(text); // 按码点拆分,中文/emoji 安全

  return (
    <span className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="reveal-char inline-block"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
