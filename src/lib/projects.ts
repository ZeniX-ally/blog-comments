import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { decodeSlug, renderMarkdown } from "@/lib/posts";

const projectsDir = path.join(process.cwd(), "content", "projects");

/**
 * 作品/项目 —— 从 content/projects/*.md 加载（gray-matter），
 * 模式对齐 posts.ts。featured: true 的项目会出现在首页。
 */
export type Project = {
  slug: string;
  name: string;
  description: string;
  /** 英文描述，缺省时英文站回退到 description */
  description_en?: string;
  tech: string[];
  year: number;
  /** 线上地址，留空则不显示 */
  link?: string;
  /** 代码仓库地址，留空则不显示 */
  repo?: string;
  featured: boolean;
  /** 可选封面图路径 */
  cover?: string;
  /** 可选摘要；缺省时用 description */
  excerpt?: string;
};

export type ProjectDetail = Project & {
  html: string;
};

function parseTech(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** 防路径穿越：slug 解码后不得含路径分隔 / 越界 */
function isSafeProjectSlug(decoded: string): boolean {
  if (decoded.length === 0) return false;
  if (decoded.includes("/") || decoded.includes("\\")) return false;
  if (decoded === "." || decoded === "..") return false;
  if (decoded.startsWith(".")) return false;
  const file = path.resolve(projectsDir, `${decoded}.md`);
  const base = path.resolve(projectsDir) + path.sep;
  return file.startsWith(base);
}

function parseProject(filename: string): Project | null {
  const raw = fs.readFileSync(path.join(projectsDir, filename), "utf8");
  const { data } = matter(raw);

  if (data.draft === true) return null;

  const fileSlug = filename.replace(/\.md$/, "");
  const slug = data.slug ? String(data.slug) : fileSlug;
  if (!isSafeProjectSlug(slug)) return null;

  const yearRaw = data.year;
  const year =
    typeof yearRaw === "number"
      ? yearRaw
      : yearRaw
        ? Number(yearRaw)
        : new Date().getFullYear();

  return {
    slug,
    name: data.name ? String(data.name) : slug,
    description: data.description
      ? String(data.description)
      : data.excerpt
        ? String(data.excerpt)
        : "",
    description_en: data.description_en ? String(data.description_en) : undefined,
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    tech: parseTech(data.tech),
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    link: data.link ? String(data.link) : undefined,
    repo: data.repo ? String(data.repo) : undefined,
    featured: data.featured === true,
    cover: data.cover ? String(data.cover) : undefined,
  };
}

/** 全部项目元信息，按年份降序、同名升序 */
export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  return fs
    .readdirSync(projectsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parseProject(file))
    .filter((p): p is Project => p !== null)
    .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name, "zh"));
}

/** 精选项目（首页用） */
export function getFeaturedProjects(limit = 4): Project[] {
  return getAllProjects()
    .filter((p) => p.featured)
    .slice(0, limit);
}

/** 按 slug 取元信息 */
export function getProjectMeta(slug: string): Project | null {
  const decoded = decodeSlug(slug);
  if (!isSafeProjectSlug(decoded)) return null;
  const file = path.join(projectsDir, `${decoded}.md`);
  if (!fs.existsSync(file)) {
    // 允许 frontmatter slug 与文件名不一致时回退扫描
    return getAllProjects().find((p) => p.slug === decoded) ?? null;
  }
  return parseProject(`${decoded}.md`);
}

/** 取详情并渲染 Markdown 正文 */
export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const decoded = decodeSlug(slug);
  if (!isSafeProjectSlug(decoded)) return null;

  let file = path.join(projectsDir, `${decoded}.md`);
  if (!fs.existsSync(file)) {
    const meta = getAllProjects().find((p) => p.slug === decoded);
    if (!meta) return null;
    file = path.join(projectsDir, `${meta.slug}.md`);
    if (!fs.existsSync(file)) {
      // 再试：按文件名扫描
      const hit = fs
        .readdirSync(projectsDir)
        .filter((f) => f.endsWith(".md"))
        .find((f) => {
          const p = parseProject(f);
          return p?.slug === decoded;
        });
      if (!hit) return null;
      file = path.join(projectsDir, hit);
    }
  }

  const meta = parseProject(path.basename(file));
  if (!meta) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);
  const html = await renderMarkdown(content);
  return { ...meta, html };
}

/** generateStaticParams 友好列表 */
export function getProjectStaticParams(): { slug: string }[] {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

