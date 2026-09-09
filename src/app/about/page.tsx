import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我和这个网站。",
};

const NOW_ITEMS = [
  {
    title: "工作",
    desc: "测试研发，FCT/IGBT 测试，上位机自动化",
    dot: "dot-running",
  },
  {
    title: "学习",
    desc: "C、C#、Rust、Go，上位机开发、自动化测试",
    dot: "dot-local",
  },
  {
    title: "生活",
    desc: "折腾数码、看动画、听音乐",
    dot: "dot-daily",
  },
] as const;

export default function AboutPage() {
  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-[50rem] pb-32 pt-20 sm:pt-24">
        <FadeIn>
          <header className="mb-12 sm:mb-16">
            <div className="page-head-label mb-6">关于</div>
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://github.com/ZeniX-ally.png?size=256"
                  alt="GitHub 头像"
                  width={88}
                  height={88}
                  className="rounded-full border border-line object-cover"
                  style={{ width: 88, height: 88 }}
                />
                <span
                  className="dot dot-running absolute bottom-1 right-1 h-3 w-3 ring-2 ring-background"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className="page-title text-[clamp(2rem,4vw,2.75rem)]">
                  阿九
                  <span className="text-faint"> / ZeniX-ally</span>
                </h1>
                <p className="mt-2 text-meta text-muted">Test Engineer · FCT / IGBT</p>
              </div>
            </div>
          </header>
        </FadeIn>

        {/* 1. Bio */}
        <FadeIn delay={40}>
          <section className="space-y-4 text-body text-muted">
            <p>
              你好，我是阿九。一名测试工程师，方向是测试研发（FCT/IGBT 测试）。
              完美主义者，对界面有洁癖——所以这个站长这样。
            </p>
            <p>
              这个网站用来记录生活、分享学习。不追更新频率，不写没想清楚的东西。
              所有文章同时提供{" "}
              <a
                href="/feed.xml"
                className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
              >
                RSS 订阅
              </a>
              。域名{" "}
              <span className="font-medium text-accent">404-found.uk</span>{" "}
              是个双关：404 通常意味着「找不到」，但在这里，它找到了你。
            </p>
          </section>
        </FadeIn>

        {/* 2. 工作 | 学习 | 生活 */}
        <section className="mt-16 sm:mt-20">
          <FadeIn>
            <h2 className="section-title mb-8">我在做什么</h2>
          </FadeIn>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-5">
            {NOW_ITEMS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 50}>
                <div className="light-card flex min-h-[8.5rem] flex-col justify-between gap-2 p-5 sm:p-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className={`dot ${item.dot}`} aria-hidden="true" />
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* 3. Contact */}
        <section className="mt-16 sm:mt-20">
          <FadeIn>
            <h2 className="section-title mb-8">联系我</h2>
          </FadeIn>
          <FadeIn delay={50}>
            <a
              href="https://github.com/ZeniX-ally"
              target="_blank"
              rel="noopener noreferrer"
              className="light-card group flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <div className="font-semibold">GitHub</div>
                <div className="text-meta text-faint">github.com/ZeniX-ally</div>
              </div>
              <span className="text-sm text-accent transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <p className="mt-4 text-sm text-muted">
              文章勘误、想法交流，或单纯想打个招呼，都欢迎。
            </p>
          </FadeIn>
        </section>
      </article>
    </BookTransition>
  );
}
