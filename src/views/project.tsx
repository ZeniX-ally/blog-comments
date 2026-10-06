import Link from "next/link";
import { ViewTransition } from "react";
import { Stagger } from "@/components/stagger";
import { SandCard } from "@/components/sand-card";
import { dict, type Lang } from "@/lib/i18n";
import { slugToHref } from "@/lib/posts";
import type { Project, ProjectDetail } from "@/lib/projects";

type ProjectViewProps = {
  lang: Lang;
  project: ProjectDetail;
  /** 相关作品(最多两张,由壳切片) */
  others: Project[];
};

/**
 * 作品详情页:「← 作品」+ h1(共享元素 project-${slug})+ 导语 + pill 组(出场编排)
 * → 封面(有则显示)→ .prose 正文 → 「相关作品」两张沙色小卡(.rise)。
 * 布局样式见 components.css「作品 / 工具 / 关于 / 404」。
 */
export function ProjectView({ lang, project, others }: ProjectViewProps) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";
  const description = lang === "en" ? (project.description_en ?? project.description) : project.description;

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <Link className="label reveal" href={`${p}/projects/`} transitionTypes={["nav-back"]}>
            ← {d.projects.back}
          </Link>
          <h1 className="reveal">
            <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
              <span>{project.name}</span>
            </ViewTransition>
          </h1>
          {description && <p className="lede reveal">{description}</p>}
          {(project.link || project.repo) && (
            <div className="pill-row reveal">
              {project.link && (
                <a className="pill" href={project.link} target="_blank" rel="noreferrer">
                  {d.projects.visit} <span className="arrow">↗</span>
                </a>
              )}
              {project.repo && (
                <a className="pill pill-light" href={project.repo} target="_blank" rel="noreferrer">
                  {d.projects.source} <span className="arrow">↗</span>
                </a>
              )}
            </div>
          )}
        </Stagger>
      </header>

      {project.cover && (
        <div className="detail-cover">
          <img src={project.cover} alt="" />
        </div>
      )}

      <div className="prose detail-body" dangerouslySetInnerHTML={{ __html: project.html }} />

      {others.length > 0 && (
        <section className="related rise">
          <div className="label">{d.projects.related}</div>
          <div className="related-grid">
            {others.map((other) => (
              <SandCard
                key={other.slug}
                small
                title={other.name}
                titleName={`project-${other.slug}`}
                href={`${p}/projects/${slugToHref(other.slug)}/`}
                description={lang === "en" ? (other.description_en ?? other.description) : other.description}
                rows={[
                  { label: d.card.year, value: other.year },
                  { label: d.card.stack, value: other.tech.join(" · ") },
                ]}
                action={d.card.view}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
