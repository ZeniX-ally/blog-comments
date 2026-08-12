import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { PostList } from "@/components/post-list";
import { FadeIn } from "@/components/fade-in";
import { RevealText } from "@/components/reveal-text";
import { SignIn } from "@/components/sign-in";

function SectionHeader({
  hex,
  title,
  en,
  moreHref,
}: {
  hex: string;
  title: string;
  en: string;
  moreHref?: string;
}) {
  return (
    <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
      <span className="font-mono text-xs text-faint">[{hex}]</span>
      <h2 className="font-display text-xl font-medium">{title}</h2>
      <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
        {en}
      </span>
      {moreHref && (
        <Link
          href={moreHref}
          className="group ml-auto font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          全部{" "}
          <span className="inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </header>
  );
}

/** 终端窗口:开机日志逐行浮现,纯 CSS 交错动画 */
function Terminal() {
  const lines = [
    { type: "cmd", text: "$ uname -a" },
    { type: "out", text: "Linux zenix-B660-VH 7.0.0-28-generic x86_64" },
    { type: "cmd", text: "$ systemctl --status" },
    { type: "ok", text: "● ollama ............... running (bge-m3)" },
    { type: "ok", text: "● memory-hub ........... running" },
    { type: "ok", text: "● jellyfin ............. running" },
    { type: "ok", text: "● 404-found.uk ......... serving since 2026" },
    { type: "cmd", text: "$ whoami" },
    { type: "me", text: "阿九" },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/70 shadow-sm">
      {/* 窗口标题栏 */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0645a]/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4caf7d]/70" aria-hidden="true" />
        <span className="ml-2 truncate font-mono text-xs text-faint">
          zenix@0xff: ~ — zsh
        </span>
      </div>
      {/* 日志 */}
      <div className="space-y-1.5 px-4 py-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`term-line ${
              line.type === "cmd"
                ? "text-fg"
                : line.type === "ok"
                  ? "text-[#4caf7d]"
                  : line.type === "me"
                    ? "text-accent-strong"
                    : "text-muted"
            }`}
            style={{ animationDelay: `${i * 130}ms` }}
          >
            {line.text}
          </div>
        ))}
        {/* 输入行 + 闪烁光标 */}
        <div className="term-line flex items-center" style={{ animationDelay: `${lines.length * 130 + 100}ms` }}>
          <span className="text-fg">$ </span>
          <span className="cursor-blink text-accent">▍</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 5);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const tagCount = new Set(posts.flatMap((p) => p.tags ?? [])).size;

  return (
    <div className="mx-auto w-full max-w-5xl py-12 sm:py-16">
      {/* ============ HERO: 终端启动画面 ============ */}
      <section className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        {/* 左:大字 + 简介 + 实时统计 */}
        <FadeIn>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x00]</span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              HOME
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-normal leading-[1.08] tracking-tight sm:text-6xl">
            <RevealText text={site.hero.greeting} />
          </h1>
          <div className="mt-5 space-y-2 text-[15px] leading-relaxed text-muted">
            {site.hero.bio.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {/* 统计数字 */}
          <div className="mt-8 flex gap-10 border-t border-line pt-6">
            {[
              { n: posts.length, label: "posts" },
              { n: projects.length, label: "projects" },
              { n: tagCount, label: "tags" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-medium text-accent-strong">
                  {s.n}
                </div>
                <div className="mt-0.5 font-mono text-[11px] tracking-widest text-faint">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          {/* 登录区 */}
          <div className="mt-6">
            <SignIn />
          </div>
        </FadeIn>

        {/* 右:终端窗口 */}
        <FadeIn delay={150}>
          <Terminal />
        </FadeIn>
      </section>

      {/* ============ 内容区 ============ */}
      <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* 最新文章 */}
        <section>
          <FadeIn>
            <SectionHeader
              hex="0x01"
              title="最新文章"
              en="LATEST POSTS"
              moreHref="/blog"
            />
          </FadeIn>
          <FadeIn delay={60}>
            <div className="border-t border-line">
              <PostList posts={latestPosts} />
            </div>
          </FadeIn>
        </section>

        {/* 精选项目 */}
        {featuredProjects.length > 0 && (
          <section>
            <FadeIn>
              <SectionHeader
                hex="0x02"
                title="精选项目"
                en="FEATURED"
                moreHref="/projects"
              />
            </FadeIn>
            <div className="grid grid-cols-1 gap-3">
              {featuredProjects.map((p, i) => (
                <FadeIn key={p.name} delay={i * 60}>
                  <div className="tool-card flex min-h-[7.5rem] flex-col justify-between gap-2 rounded-lg border border-line bg-surface/70 p-4 transition-colors hover:border-accent/60">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="led led-local" aria-hidden="true" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {p.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-line/80 pt-2 font-mono text-[11px] text-faint">
                      <span>{p.year}</span>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent transition-colors hover:underline"
                        >
                          访问 ↗
                        </a>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
