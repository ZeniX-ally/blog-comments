/**
 * 标题字符高亮:把文本中的 I / 1 / 我 染成品牌红。
 * 用于首页 hero 标题的视觉强调,不改变语义。
 */
export function HighlightChars({ text }: { text: string }) {
  const parts = text.split("");
  return (
    <>
      {parts.map((ch, i) =>
        ch === "I" || ch === "1" || ch === "我" ? (
          <span key={i} className="text-[#ff3b30]">
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  );
}
