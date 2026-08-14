"use client";

import { useRouter, usePathname } from "next/navigation";

/**
 * 文章页右上角常驻「返回上一页」胶囊按钮。
 * - 挂在 layout 的 body 层:避免页面 template 入场动画的 transform
 *   改变 fixed 定位基准(祖先 transform 会让 fixed 相对祖先而非视口,导致跳位)
 * - 仅文章页(/blog/xxx)显示
 * - hover:箭头左移 + 绿描边,纯 CSS 小动画
 * - 站内历史不足时(直接打开文章链接)回落到文章列表页
 */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // 文章页 = /blog/xxx(非 /blog 列表本身),兼容尾斜杠
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
      className="group fixed right-5 top-20 z-30 flex items-center gap-1.5 rounded-full border border-line bg-background/85 px-4 py-1.5 font-mono text-xs text-muted backdrop-blur-sm transition-colors duration-300 hover:border-accent/50 hover:text-accent sm:right-8"
    >
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
      >
        ←
      </span>
      back
    </button>
  );
}
