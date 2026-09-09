import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";
import { pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";
import { getAboutContent } from "@/lib/about";
import { getFeaturedProjects } from "@/lib/projects";
import { slugToHref } from "@/lib/posts";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();
  return pageMeta({
    title: about.title,
    description: about.description,
    path: "/about",
  });
}

export default async function AboutPage() {
  const about = await getAboutContent();
  const featured = getFeaturedProjects();
  const whoHtml = about.sectionsHtml["我是谁"] ?? "";
  const siteHtml = about.sectionsHtml["这个站"] ?? "";
  const contactHtml = about.sectionsHtml["联系"] ?? "";
  const github = site.links.github;

  return (
    <BookTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          url: site.url,
          sameAs: github ? [github] : [],
          jobTitle: "Test Engineer",
        }}
      />
      <article className="mx-auto w-full max-w-[50rem] pb-32 pt-20 sm:pt-24">
        <FadeIn>
          <header className="mb-12 sm:mb-16">
            <div className="page-head-label mb-6">{about.title}</div>
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
                  {site.name}
                  <span className="text-faint"> / ZeniX-ally</span>
                </h1>
                <p className="mt-2 text-meta text-muted">{about.subtitle}</p>
              </div>
            </div>
          </header>
        </FadeIn>

        {/* 我是谁 */}
        {whoHtml ? (
          <FadeIn delay={40}>
            <section className="space-y-4">
              <h2 className="section-title mb-6">我是谁</h2>
              <div
                className="prose text-body text-muted"
                dangerouslySetInnerHTML={{ __html: whoHtml }}
              />
            </section>
          </FadeIn>
        ) : null}

        {/* 代表作钩子：featured 来自 projects，不硬编码 */}
        {featured.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <FadeIn>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <h2 className="section-title">代表作</h2>
                <Link
                  href="/projects"
                  className="group text-sm text-muted transition-colors hover:text-accent"
                >
                  全部项目{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </header>
            </FadeIn>
            <ul className="space-y-3">
              {featured.map((p, i) => (
                <FadeIn key={p.slug} delay={i * 40}>
                  <li>
                    <Link
                      href={`/projects/${slugToHref(p.slug)}`}
                      className="light-card group flex items-start justify-between gap-4 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold transition-colors group-hover:text-accent">
                          {p.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                          {p.excerpt ?? p.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm text-accent transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 我在做什么：三卡，文案来自 about.md frontmatter */}
        {about.now.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <FadeIn>
              <h2 className="section-title mb-8">我在做什么</h2>
            </FadeIn>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-5">
              {about.now.map((item, i) => (
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
        ) : null}

        {/* 这个站 */}
        {siteHtml ? (
          <section className="mt-16 sm:mt-20">
            <FadeIn>
              <h2 className="section-title mb-6">这个站</h2>
            </FadeIn>
            <FadeIn delay={40}>
              <div
                className="prose text-body text-muted"
                dangerouslySetInnerHTML={{ __html: siteHtml }}
              />
            </FadeIn>
          </section>
        ) : null}

        {/* 联系 */}
        <section className="mt-16 sm:mt-20">
          <FadeIn>
            <h2 className="section-title mb-8">联系</h2>
          </FadeIn>
          <FadeIn delay={50}>
            {github ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="light-card group flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <div className="font-semibold">GitHub</div>
                  <div className="text-meta text-faint">
                    {github.replace(/^https?:\/\//, "")}
                  </div>
                </div>
                <span className="text-sm text-accent transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            ) : null}
            {contactHtml ? (
              <div
                className="prose mt-4 text-sm text-muted"
                dangerouslySetInnerHTML={{ __html: contactHtml }}
              />
            ) : null}
          </FadeIn>
        </section>
      </article>
    </BookTransition>
  );
}