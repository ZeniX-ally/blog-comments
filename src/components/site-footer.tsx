"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { dict, getLangFromPath } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";

/**
 * 页脚:上边 1px --hair;左「© 年份 站名」,右「GitHub — RSS — ZH / EN」,全部 mono 标签。
 * 很小,所以直接做 client component 以便从 usePathname 取语言。
 */
export function SiteFooter() {
  const pathname = usePathname();
  const d = dict[getLangFromPath(pathname)].footer;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <span className="label">
        © {year} {site.name}
      </span>
      <span className="site-footer-links label">
        {site.links.github && (
          <>
            <a href={site.links.github} target="_blank" rel="noreferrer">
              {d.github}
            </a>
            <span aria-hidden="true">—</span>
          </>
        )}
        <a href={site.links.rss}>{d.rss}</a>
        <span aria-hidden="true">—</span>
        <LanguageToggle />
      </span>
    </footer>
  );
}
