"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { dict, getLangFromPath } from "@/lib/i18n";

/**
 * 回到顶部:滚动超过 480px 且未贴近页底时显示;右下 36px 方形、--hair 边、mono ↑。
 * 显隐由 data-hidden 驱动(components.css)。
 */
export function BackToTop() {
  const pathname = usePathname();
  const d = dict[getLangFromPath(pathname)].header;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 200;
      setShow(window.scrollY > 480 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className="back-to-top"
      data-hidden={!show}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={d.top}
      title={d.top}
    >
      ↑
    </button>
  );
}
