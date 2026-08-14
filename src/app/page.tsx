import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPosts, formatDate, slugToHref } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { SignIn } from "@/components/sign-in";
import { TypewriterText } from "@/components/typewriter-text";
import { CommandLine } from "@/components/command-line";
import { BookTransition } from "@/components/book-transition";

/** 终端提示行:极简,一行提示 + 闪烁光标(装饰,不动画交错) */
function TerminalHint() {
  return (
    <p className="font-mono text-sm leading-relaxed text-muted">
      <span className="text-accent">zenix@0xff</span>
      <span className="text-faint">:~$</span>{" "}
      <span className="text-foreground">whoami</span>
      <span aria-hidden="true" className="cursor-blink ml-0.5 text-accent">
        ▍
      </span>
    </p>
  );
}

export default function Home() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 4);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const tagCount = new Set(posts.flatMap((p) => p.tags ?? [])).size;

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-24 pt-8 sm:pt-12">
      <section className="flex flex-col lg:min-h-[calc(100vh-5.75rem)]">
        {/* ============ HERO:垂直居中单栏,简约高级 ============ */}
        <div className="hero-scroll flex flex-col items-center pt-8 text-center lg:pt-14">
            <FadeIn>
            {/* 品牌标识(与顶栏呼应,内容区上方第二处) */}
            <div className="hero-brand">0xff.zone</div>
            {/* 超大主标题 */}
            <h1 className="page-title page-title--hero mt-6">
              <TypewriterText
                text={site.hero.greeting}
                speed={120}
                startDelay={300}
              />
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
              {site.hero.bio.join(" ")}
            </p>
            {/* 双 CTA 胶囊 */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer"
                className="btn-pill btn-primary"
              >
                GitHub ↗
              </a>
              <Link href="/about" className="btn-pill btn-ghost">
                关于我
              </Link>
            </div>
            {/* 统计:无分隔线,留白分隔 */}
            <div className="mt-10 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-2">
              {[
                { n: posts.length, label: "posts" },
                { n: projects.length, label: "projects" },
                { n: tagCount, label: "tags" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-display text-2xl font-medium text-accent-strong">
                    {s.n}
                  </span>
                  <span className="ml-2 font-mono text-[10px] tracking-widest text-faint">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* 终端提示 + 登录区 */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <TerminalHint />
              <SignIn />
            </div>
            </FadeIn>
        </div>

        {/* ============ 命令彩蛋:居中,随滚动下沉淡出 ============ */}
        <div className="panel-sink mx-auto mt-14 w-full max-w-2xl">
          <FadeIn delay={100}>
            <CommandLine lang="zh" />
          </FadeIn>
        </div>

        {/* ============ 双栏紧凑列表(首屏全览) ============ */}
        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* 最新文章 */}
          <section>
            <FadeIn>
              <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-faint">[0x01]</span>
                <h2 className="font-display text-xl font-medium">最新文章</h2>
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  LATEST
                </span>
                <Link
                  href="/blog"
                  className="group ml-auto font-mono text-xs text-muted transition-colors hover:text-accent"
                >
                  全部{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </header>
            </FadeIn>
            <FadeIn delay={60}>
              {latestPosts.map((post, i) => (
                <FadeIn key={post.slug} delay={i * 40}>
                  <Link
                    href={`/blog/${slugToHref(post.slug)}`}
                    className="post-row post-row--tight grid gap-x-5 gap-y-0.5 sm:grid-cols-[6rem_1fr]"
                  >
                    <time className="post-row-meta pt-[3px]">
                      {formatDate(post.date)}
                    </time>
                    <div className="min-w-0">
                      <div className="post-row-title">{post.title}</div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </FadeIn>
          </section>

          {/* 精选项目 */}
          {featuredProjects.length > 0 && (
            <section>
              <FadeIn>
                <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-faint">[0x02]</span>
                  <h2 className="font-display text-xl font-medium">精选项目</h2>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                    FEATURED
                  </span>
                  <Link
                    href="/projects"
                    className="group ml-auto font-mono text-xs text-muted transition-colors hover:text-accent"
                  >
                    全部{" "}
                    <span className="inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </header>
              </FadeIn>
              <FadeIn delay={60}>
                {featuredProjects.map((p, i) => (
                  <FadeIn key={p.name} delay={i * 40}>
                    <div className="post-row post-row--tight grid gap-x-5 gap-y-0.5 sm:grid-cols-[6rem_1fr]">
                      <div className="post-row-meta pt-[3px]">{p.year}</div>
                      <div className="min-w-0">
                        <div className="post-row-title flex flex-wrap items-center gap-x-2">
                          <span>{p.name}</span>
                          {p.link && (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs text-accent transition-colors hover:underline"
                            >
                              访问 ↗
                            </a>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[13px] leading-relaxed text-muted">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </FadeIn>
            </section>
          )}
        </div>
      </section>
      </article>
    </BookTransition>
  );
}
