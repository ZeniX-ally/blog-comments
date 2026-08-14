"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 文章行点击 → 行变形成一本翻页的书,翻页后进入文章。
 * - 仅拦截 .post-row 内的文章链接(其余链接正常导航)
 * - 动画编排:行淡出 → 书本封面从行位置长出(3D 立体感) → 书页向右翻动两次
 *   → 收场淡出 → 路由导航
 * - prefers-reduced-motion:不播动画直接导航
 */
export function BookMorph() {
  const router = useRouter();

  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const row = link.closest<HTMLElement>(".post-row");
      if (!row) return;
      if (!link.pathname.includes("/blog/")) return;
      if (link.origin !== location.origin) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      // 捕获阶段拦截:阻止 React Link 先触发导航,动画播完后再 push
      e.preventDefault();
      e.stopPropagation();
      const to = link.pathname + link.search + link.hash;
      if (reduced) {
        router.push(to);
        return;
      }
      const title =
        row.querySelector(".post-row-title")?.textContent?.trim() || "文章";
      playBook(row, title, () => router.push(to));
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}

function playBook(row: HTMLElement, title: string, done: () => void) {
  const rect = row.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 书本目标尺寸(竖版,居中偏上留出翻页空间)
  const bookW = Math.min(rect.width * 0.34, 300);
  const bookH = Math.min(bookW * 1.45, 430);
  const bx = vw / 2 - bookW / 2;
  const by = Math.max(64, vh * 0.36 - bookH / 2);

  const stage = document.createElement("div");
  stage.style.cssText =
    "position:fixed;inset:0;z-index:9997;pointer-events:none;perspective:1500px;";
  document.body.appendChild(stage);

  const cleanup = () => {
    stage.remove();
  };

  // ---------- 1) 原行淡出 ----------
  const clone = row.cloneNode(true) as HTMLElement;
  clone.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;transform-origin:center;`;
  stage.appendChild(clone);
  const fadeOut = clone.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 320, easing: "ease-out", fill: "forwards" },
  );

  // ---------- 2) 书封面:从行位置长出,变形成书 ----------
  const cover = document.createElement("div");
  cover.innerHTML = `
    <div style="position:absolute;left:5px;top:0;bottom:0;width:4px;background:linear-gradient(180deg,rgba(0,255,156,.75),rgba(0,255,156,.15));border-radius:2px;"></div>
    <div style="position:absolute;inset:0;padding:14% 12%;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;">
      <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.25em;color:rgba(0,255,156,.7);">0xff.zone</div>
      <div style="font-size:15px;line-height:1.5;color:#f2f2f2;text-align:left;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;">${escapeHtml(title)}</div>
      <div style="font-family:ui-monospace,monospace;font-size:10px;color:rgba(255,255,255,.3);display:flex;justify-content:space-between;"><span>0x01</span><span>OPEN</span></div>
    </div>`;
  cover.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;background:#0e0e13;border:1px solid rgba(0,255,156,.4);border-left:1px solid rgba(0,255,156,.8);border-radius:4px 10px 10px 4px;box-shadow:0 24px 60px rgba(0,0,0,.55);transform-origin:center;backface-visibility:hidden;opacity:0;`;
  stage.appendChild(cover);
  const growBook = cover.animate(
    [
      { transform: "translate(0,0) scale(1,1)", opacity: 0 },
      {
        transform: `translate(${bx - rect.left}px, ${by - rect.top}px) scale(${bookW / rect.width}, ${bookH / rect.height})`,
        opacity: 1,
        borderRadius: "4px 10px 10px 4px",
      },
    ],
    {
      duration: 460,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
      delay: 80,
    },
  );

  // ---------- 3) 书页翻动:两页依次从左向右翻开 ----------
  const makePage = (delayMs: number, pageNo: number) => {
    const page = document.createElement("div");
    page.innerHTML = `
      <div style="position:absolute;inset:0;padding:13% 10% 9%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
        <div style="font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.2em;color:rgba(0,255,156,.45);">0xff.zone</div>
        <div style="font-size:13px;line-height:1.65;color:#d8d8de;overflow:hidden;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;">${escapeHtml(title)}</div>
        <div>
          <div style="height:1px;background:rgba(0,255,156,.2);margin-bottom:7px;"></div>
          <div style="font-family:ui-monospace,monospace;font-size:9px;color:rgba(255,255,255,.28);display:flex;justify-content:space-between;"><span>0x0${pageNo}</span><span>·</span></div>
        </div>
      </div>`;
    page.style.cssText = `position:absolute;left:${bx}px;top:${by}px;width:${bookW / 2}px;height:${bookH}px;background:linear-gradient(180deg,#16161d,#121218);border:1px solid rgba(255,255,255,.08);border-radius:2px 10px 10px 2px;transform-origin:left center;backface-visibility:hidden;opacity:0;box-shadow:inset 0 0 24px rgba(0,0,0,.4);`;
    stage.appendChild(page);
    return page.animate(
      [
        { transform: "rotateY(0deg)", opacity: 1 },
        { transform: "rotateY(-178deg)", opacity: 1 },
        { transform: "rotateY(-178deg)", opacity: 0 },
      ],
      {
        duration: 340,
        delay: delayMs,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "both",
      },
    );
  };

  const flip1 = makePage(560, 1);
  const flip2 = makePage(900, 2);

  // ---------- 4) 收场:书淡出,导航 ----------
  const T_TOTAL = 1380;
  const fin = cover.animate(
    [
      { opacity: 1, transform: `translate(${bx - rect.left}px, ${by - rect.top}px) scale(${bookW / rect.width}, ${bookH / rect.height})` },
      { opacity: 0, transform: `translate(${bx - rect.left}px, ${by - rect.top + 14}px) scale(${(bookW / rect.width) * 0.94}, ${(bookH / rect.height) * 0.94})` },
    ],
    { duration: 220, delay: T_TOTAL - 220, easing: "ease-in", fill: "forwards" },
  );

  Promise.all([fadeOut, growBook, flip1, flip2, fin].map((a) => a.finished)).then(
    () => {
      cleanup();
      done();
    },
  );
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
