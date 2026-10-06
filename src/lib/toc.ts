export type TocItem = { id: string; text: string; level: 2 | 3 };

const HEADING = /<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;

/** 从渲染后的 HTML 抽 h2/h3。无 id 的标题跳过；标题内的标签剥掉。 */
export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  for (const m of html.matchAll(HEADING)) {
    const level = Number(m[1]) as 2 | 3;
    const text = m[3].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    items.push({ id: m[2], text, level });
  }
  return items;
}
