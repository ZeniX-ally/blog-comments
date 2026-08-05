import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { PostList } from "@/components/post-list";
import { FadeIn } from "@/components/fade-in";
import { Spotlight } from "@/components/spotlight";
import { RevealText } from "@/components/reveal-text";

function SectionHeading({ title, moreHref }: { title: string; moreHref?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-mono text-xs uppercase tracking-widest text-faint">{title}</h2>
      {moreHref && (
        <Link href={moreHref} className="group text-sm text-muted transition-colors hover:text-accent">
          全部 <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 5);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
        {/* Hero —— 官方式排版:超大字贴左,简介贴右 */}
      <section className="py-12 sm:py-16">
        <div className="mt-8 sm:mt-12">
          <Spotlight>
            <FadeIn>
              <h1 className="font-display text-6xl font-normal leading-[1.04] tracking-tight sm:text-7xl xl:text-8xl">
                <RevealText text={site.hero.greeting} />
              </h1>
            </FadeIn>
            <FadeIn delay={120}>
              <div className="mt-10 max-w-xl space-y-2 text-base leading-relaxed text-muted sm:text-lg">
                {site.hero.bio.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </FadeIn>
          </Spotlight>
        </div>
      </section>

      {/* 最新文章 */}
      <section className="pb-16">
        <SectionHeading title="最新文章" moreHref="/blog" />
        <div className="mt-4 border-t border-line">
          <PostList posts={latestPosts} />
        </div>
      </section>

      {/* 精选项目 */}
      {featuredProjects.length > 0 && (
        <section className="pb-20">
          <SectionHeading title="精选项目" moreHref="/projects" />
          <ul className="mt-4 border-t border-line">
            {featuredProjects.map((project) => (
              <li key={project.name} className="border-b border-line py-5 last:border-b-0">
                <div className="flex items-baseline justify-between gap-6">
                  <h3 className="text-lg font-normal">{project.name}</h3>
                  <span className="shrink-0 font-mono text-xs text-faint">{project.year}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{project.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
