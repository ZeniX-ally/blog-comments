import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageMetaInput = {
  /** 页面标题（会走 layout template，除非 absolute） */
  title: string | { absolute: string };
  description: string;
  /** 站点内路径，如 "/"、"/blog"、"/projects/foo" */
  path: string;
  /** OG/Twitter 图，默认 default OG */
  images?: string[];
  type?: "website" | "article";
};

/** 绝对 canonical URL（中文主站，无尾斜杠除首页） */
export function canonicalUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * 统一页面 metadata：title/description + canonical + OG + twitter。
 * 图路径可为相对（依赖 layout metadataBase）或绝对。
 */
export function pageMeta({
  title,
  description,
  path,
  images = ["/og/default.png"],
  type = "website",
}: PageMetaInput): Metadata {
  const url = canonicalUrl(path);
  const ogTitle = typeof title === "string" ? title : title.absolute;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: site.name,
      type,
      locale: "zh_CN",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images,
    },
  };
}
