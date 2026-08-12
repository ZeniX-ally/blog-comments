"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, getLangFromPath, switchPath, type Lang } from "@/lib/i18n";

/**
 * 语言切换器:顶栏右侧。
 * 当前中文 → 显示 "EN" 链到英文对应页;当前英文 → 显示 "中文" 链回中文页。
 * 切换时保持当前页面(同路径互切)。
 */
export function LanguageToggle() {
  const pathname = usePathname();
  const current = getLangFromPath(pathname);
  const to: Lang = current === "zh" ? "en" : "zh";
  // 显示"目标语言"的标签:中文站显示 EN,英文站显示 中文
  const label = dict[current].switchLabel;

  return (
    <Link
      href={switchPath(pathname, to)}
      className="font-mono text-xs text-faint transition-colors hover:text-accent"
      aria-label={to === "zh" ? "切换到中文" : "Switch to English"}
      title={to === "zh" ? "切换到中文" : "Switch to English"}
    >
      {label}
    </Link>
  );
}
