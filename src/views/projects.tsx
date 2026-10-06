import Link from "next/link";
import { ViewTransition } from "react";
import { Stagger } from "@/components/stagger";
import { dict, type Lang } from "@/lib/i18n";
import { slugToHref } from "@/lib/posts";
import type { Project } from "@/lib/projects";

/**
 * 作品卡:沙色卡变体 .project-card。顶部 16:9 封面(有 cover 放图,否则 serif 首字母占位)
 * → h3(共享元素 project-${slug},与详情页 h1 morph)→ 说明 → Year / Stack 行。
 * 不走 SandCard:它没有封面槽位。样式见 components.css「作品 / 工具 / 关于 / 404」。
 */
function ProjectCard({ lang, project }: { lang: Lang; project: Project }) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";
  const description = lang === "en" ? (project.description_en ?? project.description) : project.description;

  return (
    <Link className="sand-card project-card" href={`${p}/projects/${slugToHref(project.slug)}/`}>
      <div className="cover">{project.cover ? <img src={project.cover} alt="" /> : project.name.slice(0, 1)}</div>
      <div className="body">
        <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
          <h3>{project.name}</h3>
        </ViewTransition>
        {description && <p>{description}</p>}
        <div className="sand-card-rows">
          <div>
            <span className="label">{d.card.year}</span>
            <span>{project.year}</span>
          </div>
          <div>
            <span className="label">{d.card.stack}</span>
            <span>{project.tech.join(" · ")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** 作品列表页:标签 `Selected Work · N` + h1(出场编排)→ 两栏卡网格(.rise;≤760px 单栏) */
export function ProjectsView({ lang, projects }: { lang: Lang; projects: Project[] }) {
  const d = dict[lang];

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.projects.label(projects.length)}</div>
          <h1 className="reveal">{d.projects.title}</h1>
        </Stagger>
      </header>
      {projects.length === 0 ? (
        <div className="page-body">
          <p className="lede">{d.projects.empty}</p>
        </div>
      ) : (
        <div className="project-grid rise">
          {projects.map((project) => (
            <ProjectCard key={project.slug} lang={lang} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
