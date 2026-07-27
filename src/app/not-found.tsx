import Link from "next/link";

/** 自定义 404 页:替换 Next 默认,沿用极简风格 */
export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-faint">404</p>
      <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        这里什么也没有
      </h1>
      <p className="mt-4 max-w-sm text-muted">
        你访问的页面不存在，或者已经被移走了。
      </p>
      <Link
        href="/"
        className="mt-8 text-sm text-accent underline decoration-faint underline-offset-4 transition-colors hover:decoration-accent"
      >
        ← 回到首页
      </Link>
    </section>
  );
}
