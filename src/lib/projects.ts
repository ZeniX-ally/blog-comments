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

export const projects: Project[] = [];
