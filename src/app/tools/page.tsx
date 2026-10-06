import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";
import { pageMeta } from "@/lib/seo";
import { TOOL_SECTIONS, type ToolStatus } from "@/lib/tools";

export const metadata: Metadata = pageMeta({
  title: "工具清单",
  description: "自建服务与常用工具清单。",
  path: "/tools",
});

const SECTIONS = TOOL_SECTIONS.zh;

const STATUS_META: Record<ToolStatus, { label: string; dot: string }> = {
  RUNNING: { label: "运行中", dot: "dot-running" },
  LOCAL: { label: "本机", dot: "dot-local" },
  LAB: { label: "工作", dot: "dot-lab" },
  DAILY: { label: "日常", dot: "dot-daily" },
};

export default function ToolsPage() {
  const total = SECTIONS.reduce((n, s) => n + s.tools.length, 0);

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">工具</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              工具清单
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              自建服务与常用工具。
            </p>
            <div className="mt-8 text-xs text-faint">{total} 项工具</div>
          </aside>
        </FadeIn>

        {/* 右栏:工具分区 */}
        <div className="min-w-0 pb-10">
          <div className="space-y-20">
            {SECTIONS.map((sec, si) => (
              <section key={sec.title}>
                <FadeIn delay={si * 60}>
                  <header className="mb-8">
                    <h2 className="font-display text-2xl font-medium">{sec.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-faint">
                      {sec.en}
                    </p>
                  </header>
                </FadeIn>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {sec.tools.map((t, ti) => {
                    const meta = STATUS_META[t.status];
                    return (
                      <FadeIn key={t.name} delay={si * 60 + ti * 40}>
                        <div className="light-card flex min-h-[8.5rem] flex-col justify-between gap-2 p-6">
                          <div className="flex items-start gap-3">
                            <span className={`dot ${meta.dot} mt-1.5`} aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-medium leading-snug">{t.name}</span>
                                <span className="shrink-0 text-[10px] text-faint">
                                  {meta.label}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-muted">
                                {t.desc}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-line pt-3 text-[11px] text-faint">
                            <span>{t.tag}</span>
                          </div>
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      </article>
    </BookTransition>
  );
}
