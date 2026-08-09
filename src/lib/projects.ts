/**
 * 作品/项目数据 —— 在这里维护你的项目列表。
 * featured: true 的项目会显示在首页。
 */
export type Project = {
  name: string;
  description: string;
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
    tech: ["Next.js", "React", "Tailwind", "Cloudflare Pages"],
    year: 2026,
    link: "https://404-found.uk",
    featured: true,
  },
  {
    name: "MT4 EA",
    description: "外汇自动化交易 EA，中长线策略，全自动运行不人工干预。",
    tech: ["MQL4", "MT4"],
    year: 2026,
    featured: true,
  },
];
