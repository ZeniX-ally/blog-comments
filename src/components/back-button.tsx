"use client";

import { useRouter, usePathname } from "next/navigation";

/**
 * 文章页右上角常驻「返回上一页」胶囊按钮。
 * 仅文章页(/blog/xxx)显示;站内历史不足时回落到文章列表页。
 */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const isPostPage = /^\/blog\/[^/]+/.test(pathname);
  if (!isPostPage) return null;

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/blog");
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="返回上一页"
      className="group fixed right-5 top-20 z-30 flex items-center gap-1.5 rounded-full border border-line bg-background/80 px-4 py-1.5 text-xs text-muted backdrop-blur-md transition-colors duration-200 hover:border-accent/50 hover:text-accent sm:right-8"
    >
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-200 group-hover:-translate-x-1"
      >
        ←
      </span>
      返回
    </button>
  );
}
