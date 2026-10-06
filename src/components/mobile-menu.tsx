"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, type Lang } from "@/lib/i18n";

/**
 * ≤640px 的导航:mono 文字按钮「菜单 / 关闭」,展开时在顶栏下方铺一列导航(全宽、细线分隔)。
 * 记录「在哪个路径下打开」而不是布尔值:路由一变 open 自然为 false,不需要 effect。
 */
export function MobileMenu({ items, lang }: { items: readonly { href: string; label: string }[]; lang: Lang }) {
  const pathname = usePathname();
  const id = useId();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const d = dict[lang].header;

  return (
    <>
      <button
        type="button"
        className="mobile-menu-button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpenAt(open ? null : pathname)}
      >
        {open ? d.close : d.menu}
      </button>
      {open && (
        <nav id={id} className="mobile-menu" aria-label={d.nav}>
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpenAt(null)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
