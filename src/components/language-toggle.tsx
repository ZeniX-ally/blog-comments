"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, getLangFromPath, switchPath, type Lang } from "@/lib/i18n";

/**
 * 语言切换器:顶栏右侧。
 * 当前中文 → 显示 "EN";当前英文 → 显示 "中文"。
 */
export function LanguageToggle() {
  const pathname = usePathname();
  const current = getLangFromPath(pathname);
  const to: Lang = current === "zh" ? "en" : "zh";
  const label = dict[current].switchLabel;

  return (
    <Link
      href={switchPath(pathname, to)}
      className="text-xs font-medium text-faint transition-colors hover:text-accent"
      aria-label={to === "zh" ? "切换到中文" : "Switch to English"}
      title={to === "zh" ? "切换到中文" : "Switch to English"}
    >
      {label}
    </Link>
  );
}
