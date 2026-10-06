import Link from "next/link";
import { ViewTransition } from "react";
import { Stagger } from "@/components/stagger";
import { SandCard } from "@/components/sand-card";
import { Toc } from "@/components/toc";
import { ScrollSpy } from "@/components/scroll-spy";
import { Comments } from "@/components/comments";
import { dict, type Lang } from "@/lib/i18n";
import { extractToc } from "@/lib/toc";
import { formatDate, slugToHref, type Post, type PostMeta } from "@/lib/posts";
import type { Project } from "@/lib/projects";

type PostViewProps = {
  lang: Lang;
  post: Post;
  adjacent: { prev: PostMeta | null; next: PostMeta | null };
  /** 上一篇 / 下一篇不足两张时,用精选作品补足 */
  fallbackProjects: Project[];
};

/**
 * 文章页:返回链接 + h1(共享元素 post-${slug})+ 导语(出场编排)
 * → 两栏:左元数据 + 目录(sticky),右 .prose → 继续阅读两张小卡 → 评论。
 * 布局样式见 components.css「文章」。
 */
export function PostView({ lang, post, adjacent, fallbackProjects }: PostViewProps) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";
  const toc = extractToc(post.html);

  const postCards = [adjacent.prev, adjacent.next]
    .filter((item): item is PostMeta => item !== null)
    .map((item) => (
      <SandCard
        key={`post-${item.slug}`}
        small
        title={item.title}
        titleName={`post-${item.slug}`}
        href={`${p}/blog/${slugToHref(item.slug)}/`}
        description={item.excerpt}
        rows={[
          { label: d.card.date, value: formatDate(item.date) },
          { label: d.card.category, value: d.card.post },
        ]}
        action={d.card.read}
      />
    ));
  const projectCards = fallbackProjects.slice(0, Math.max(0, 2 - postCards.length)).map((proj) => (
    <SandCard
      key={`project-${proj.slug}`}
      small
      title={proj.name}
      titleName={`project-${proj.slug}`}
      href={`${p}/projects/${slugToHref(proj.slug)}/`}
      description={lang === "en" ? (proj.description_en ?? proj.description) : proj.description}
      rows={[
        { label: d.card.date, value: proj.year },
        { label: d.card.category, value: d.card.project },
      ]}
      action={d.card.view}
    />
  ));
  const moreCards = [...postCards, ...projectCards];

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <Link className="label reveal" href={`${p}/blog/`} transitionTypes={["nav-back"]}>
            ← {d.blog.back}
          </Link>
          <h1 className="reveal">
            <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
              <span>{post.title}</span>
            </ViewTransition>
          </h1>
          {post.excerpt && <p className="lede reveal">{post.excerpt}</p>}
        </Stagger>
      </header>

      <div className="page-body">
        <div className="post-grid">
          <aside className="post-side">
            <div className="meta-rows">
              <div>
                <span className="label">{d.card.date}</span>
                <span>{formatDate(post.date)}</span>
              </div>
              {post.tags.length > 0 && (
                <div>
                  <span className="label">{d.card.category}</span>
                  <span>{post.tags[0]}</span>
                </div>
              )}
              <div>
                <span className="label">{d.card.reading}</span>
                <span>{d.blog.minutes(post.readingTime)}</span>
              </div>
              {post.tags.length > 0 && (
                <div>
                  <span className="label">{d.card.tags}</span>
                  <span>{post.tags.join(" · ")}</span>
                </div>
              )}
            </div>
            <Toc items={toc} label={d.blog.toc} />
          </aside>
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>

        {moreCards.length > 0 && (
          <section className="post-more rise">
            <div className="label">{d.blog.more}</div>
            <div className="post-more-grid">{moreCards}</div>
          </section>
        )}

        <Comments label={d.blog.comments} />
      </div>
      <ScrollSpy ids={toc.map((item) => item.id)} />
    </div>
  );
}
