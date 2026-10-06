import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Stagger } from "@/components/stagger";
import { SandCard } from "@/components/sand-card";
import { HairRow } from "@/components/hair-row";
import { dict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";
import type { Project } from "@/lib/projects";

type HomeViewProps = {
  lang: Lang;
  posts: PostMeta[];
  /** 精选作品(已切片,首页最多用前两个) */
  projects: Project[];
  /** 全部作品数,入口清单计数用 */
  projectCount: number;
  tagCount: number;
  toolCount: number;
};

/** "I'm {Zenix}." → 文本与 .underline-draw 下划线词交替 */
function renderHeadline(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\{([^}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    out.push(
      <span key={m.index} className="underline-draw">
        {m[1]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** 卡片 DETAILS 行:若干下划线词,空格分隔 */
function underlined(items: string[]): ReactNode {
  return items.map((item, i) => (
    <Fragment key={item}>
      {i > 0 && " "}
      <u>{item}</u>
    </Fragment>
  ));
}

/**
 * 首页:Hero(两栏)→ 三张沙色卡 → 陈述 + 入口清单。
 * 首屏走出场编排(.mask / .reveal / .underline-draw),下方区块走 .rise 滚动浮现。
 * 布局样式见 components.css「首页」。
 */
export function HomeView({ lang, posts, projects, projectCount, tagCount, toolCount }: HomeViewProps) {
  const d = dict[lang];
  const copy = site.home[lang];
  const p = lang === "en" ? "/en" : "";

  const projectCards = projects.slice(0, 2).map((proj) => (
    <SandCard
      key={`project-${proj.slug}`}
      title={proj.name}
      titleName={`project-${proj.slug}`}
      href={`${p}/projects/${slugToHref(proj.slug)}/`}
      description={lang === "en" ? (proj.description_en ?? proj.description) : proj.description}
      rows={[
        { label: d.card.date, value: proj.year },
        { label: d.card.category, value: d.card.project },
        { label: d.card.details, value: underlined(proj.tech.slice(0, 3)) },
      ]}
      action={d.card.view}
    />
  ));
  const postCards = posts.slice(0, 3).map((post) => (
    <SandCard
      key={`post-${post.slug}`}
      title={post.title}
      titleName={`post-${post.slug}`}
      href={`${p}/blog/${slugToHref(post.slug)}/`}
      description={post.excerpt}
      rows={[
        { label: d.card.date, value: formatDate(post.date) },
        { label: d.card.category, value: d.card.post },
        { label: d.card.details, value: underlined(post.tags.slice(0, 2)) },
      ]}
      action={d.card.read}
    />
  ));
  const cards = [...projectCards, ...postCards].slice(0, 3);

  return (
    <div className="content">
      <section className="home-hero">
        <h1>
          {copy.headline.map((line, i) => (
            <div key={i} className="mask">
              <span style={{ ["--i" as string]: i } as CSSProperties}>{renderHeadline(line)}</span>
            </div>
          ))}
        </h1>
        <Stagger start={3} className="home-lede">
          {copy.lede.map((para, i) => (
            <p key={i} className="lede reveal">
              {para}
            </p>
          ))}
          <p className="label reveal">{d.home.stats(posts.length, projects.length, tagCount)}</p>
        </Stagger>
      </section>

      {cards.length > 0 && (
        <section className="home-section rise">
          <div className="home-section-head">
            <h2>{d.home.work}</h2>
            <Link href={`${p}/blog/`} className="label">
              {d.home.all} →
            </Link>
          </div>
          <div className="home-cards">{cards}</div>
        </section>
      )}

      <section className="home-statement rise">
        <h2>{copy.statement}</h2>
        <div className="hair-list">
          <HairRow href={`${p}/blog/`} title={d.home.entries.posts} trailing={d.home.counts.posts(posts.length)} />
          <HairRow href={`${p}/projects/`} title={d.home.entries.projects} trailing={d.home.counts.projects(projectCount)} />
          <HairRow href={`${p}/tools/`} title={d.home.entries.tools} trailing={d.home.counts.tools(toolCount)} />
          <HairRow href={`${p}/about/`} title={d.home.entries.about} trailing="→" />
          <HairRow href="/feed.xml" title={d.home.entries.rss} trailing={<span className="label--raw">feed.xml</span>} external />
        </div>
      </section>
    </div>
  );
}
