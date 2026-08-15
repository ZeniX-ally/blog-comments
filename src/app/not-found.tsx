import Link from "next/link";
import { BookTransition } from "@/components/book-transition";

/** 404 页:域名梗彩蛋 —— "404 not found" 反写为 "404 found" */
export default function NotFound() {
  return (
    <BookTransition>
      <section className="flex min-h-[50vh] flex-col items-center justify-center py-32 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-faint">404</p>
      <h1 className="page-title mt-8">很好，你找到了这里</h1>
      <p className="mt-6 max-w-sm text-muted">
        本站域名叫 404-found，所以没有页面反而是对的——
        <br className="hidden sm:block" />
        只是这个地址暂时还不存在。
      </p>
      <Link href="/" className="btn-pill btn-ghost mt-10">
        ← 回到首页
      </Link>
      </section>
    </BookTransition>
  );
}
