"use client";

import { useEffect } from "react";

/**
 * 目录联动:观察给定 id 的标题,进入 / 离开视口上 40% 区域时重算,
 * 把「最后一个顶边在视口 40% 以上的标题」对应的 .toc a[href="#id"] 置 .is-active(同一时刻至多一个)。
 * 仅用 IntersectionObserver(rootMargin 下边 -60%),不监听 scroll。
 */
export function ScrollSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const heads = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (heads.length === 0) return;

    const links = new Map<string, Element | null>(
      heads.map((h) => [h.id, document.querySelector(`.toc a[href="#${CSS.escape(h.id)}"]`)]),
    );
    let active: string | null = null;
    const setActive = (id: string | null) => {
      if (id === active) return;
      if (active) links.get(active)?.classList.remove("is-active");
      if (id) links.get(id)?.classList.add("is-active");
      active = id;
    };

    const update = () => {
      const limit = window.innerHeight * 0.4;
      let current: HTMLElement | null = null;
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= limit) current = h;
        else break;
      }
      setActive(current ? current.id : null);
    };

    const io = new IntersectionObserver(update, { rootMargin: "0px 0px -60% 0px" });
    heads.forEach((h) => io.observe(h));
    update();
    return () => {
      io.disconnect();
      setActive(null);
    };
  }, [ids]);

  return null;
}
