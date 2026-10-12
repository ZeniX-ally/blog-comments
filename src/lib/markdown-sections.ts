/**
 * 把 Markdown 正文按 `## ` 二级标题切成若干节。
 * 关于页与公益页共用；只认二级标题（`###` 属于上一节的内容）。
 */
export function splitMarkdownSections(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let current: string | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (current) map.set(current, buf.join("\n").trim());
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1].trim();
      buf.length = 0;
    } else if (current) {
      buf.push(line);
    }
  }
  flush();
  return map;
}
