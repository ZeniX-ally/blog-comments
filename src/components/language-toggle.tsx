"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, getLangFromPath, switchPath, type Lang } from "@/lib/i18n";

/**
 * 语言开关:固定写作 "ZH / EN",当前语言 --fg、另一个 --muted(data-on 控制)。
 * 点击后跳到另一语言下的同一页面(switchPath)。顶栏与页脚共用。
 */
export function LanguageToggle() {
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);
  const other: Lang = lang === "zh" ? "en" : "zh";

  return (
    <Link
      className="label lang-toggle"
      href={switchPath(pathname, other)}
      hrefLang={other === "en" ? "en" : "zh-CN"}
      aria-label={dict[lang].header.lang}
    >
      <b data-on={lang === "zh"}>ZH</b> / <b data-on={lang === "en"}>EN</b>
    </Link>
  );
}
