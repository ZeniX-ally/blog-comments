"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { dict, getLangFromPath } from "@/lib/i18n";

type Theme = "light" | "dark";

/**
 * 明暗切换。状态持久化于 localStorage("theme"),<html> 上切 .dark。
 * 切换前给 <html> 加 .theme-switching(motion.css 里统一 400ms 颜色过渡),400ms 后移除;
 * ☾ / ☀ 两枚线描图标叠放在 .theme-icon 里,用 data-hidden 交叉淡入。
 */
export function ThemeToggle() {
  const pathname = usePathname();
  const d = dict[getLangFromPath(pathname)].header;
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
    return () => window.clearTimeout(timer.current);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    root.classList.add("theme-switching");
    void root.offsetWidth; // 先让 .theme-switching 的 transition 生效,再改颜色
    root.classList.toggle("dark", next === "dark");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => root.classList.remove("theme-switching"), 400);
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const label = theme === "dark" ? d.themeToLight : d.themeToDark;

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {mounted && (
        <span className="theme-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-hidden={theme !== "dark"}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-hidden={theme !== "light"}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </span>
      )}
    </button>
  );
}
