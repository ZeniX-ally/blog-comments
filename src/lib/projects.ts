/**
 * 作品/项目数据 —— 在这里维护你的项目列表。
 * featured: true 的项目会显示在首页。
 * description_en 供英文站使用(可省略,省略时英文站复用 description)。
 */
export type Project = {
  name: string;
  description: string;
  /** 英文描述,缺省时英文站回退到 description */
  description_en?: string;
  tech: string[];
  year: number;
  /** 线上地址，留空则不显示 */
  link?: string;
  /** 代码仓库地址，留空则不显示 */
  repo?: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    name: "404-found.uk",
    description: "这个博客：Next.js 16 静态站点，部署在 Cloudflare Pages，带评论、统计、搜索。",
    description_en: "This blog: a Next.js 16 static site on Cloudflare Pages, with comments, analytics and search.",
    tech: ["Next.js", "React", "Tailwind", "Cloudflare Pages"],
    year: 2026,
    link: "https://404-found.uk",
    featured: true,
  },
  {
    name: "MT4 EA",
    description: "外汇自动化交易 EA，中长线策略，全自动运行不人工干预。",
    description_en: "A fully-automated forex trading EA with medium/long-term strategies, no manual intervention.",
    tech: ["MQL4", "MT4"],
    year: 2026,
    featured: true,
  },
];
