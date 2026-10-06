import Link from "next/link";
import { Stagger } from "@/components/stagger";
import { SandCard } from "@/components/sand-card";
import { HairRow } from "@/components/hair-row";
import { dict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { slugToHref } from "@/lib/posts";
import type { AboutContent } from "@/lib/about";
import type { Project } from "@/lib/projects";

type AboutViewProps = {
  lang: Lang;
  about: AboutContent;
  /** 代表作(getFeaturedProjects) */
  featured: Project[];
};

/**
 * about.md 里各节的 `##` 标题(内容键)。与 dict.about 的显示标签分开:
 * 改界面文案不会让某一节消失。zh 读 content/about.md,en 读 content/en/about.md。
 */
const SECTION_KEYS: Record<Lang, { who: string; site: string; contact: string }> = {
  zh: { who: "我是谁", site: "这个站", contact: "联系" },
  en: { who: "Who I am", site: "This Site", contact: "Contact" },
};

const AVATAR = "https://github.com/ZeniX-ally.png?size=256";

/**
 * 关于页:头像 88px + h1 站名 + serif 副标题(出场编排)
 * → 「我是谁」.prose → 「代表作」沙色小卡 → 「我在做什么」三张沙色卡
 * → 「这个站」.prose → 「联系」细线行 GitHub + 可选 prose。各节 .rise,mono 标签作节名。
 * 布局样式见 components.css「作品 / 工具 / 关于 / 404」。
 */
export function AboutView({ lang, about, featured }: AboutViewProps) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";
  const keys = SECTION_KEYS[lang];
  const whoHtml = about.sectionsHtml[keys.who] ?? "";
  const siteHtml = about.sectionsHtml[keys.site] ?? "";
  const contactHtml = about.sectionsHtml[keys.contact] ?? "";
  const github = site.links.github;

  return (
    <div className="content">
      <header className="page-head">
        <Stagger className="about-head">
          <img className="reveal" src={AVATAR} alt="" width={88} height={88} />
          <div className="reveal">
            <h1>{site.name}</h1>
            <p className="lede">{about.subtitle}</p>
          </div>
        </Stagger>
      </header>

      <div className="page-body">
        {whoHtml && (
          <section className="about-section rise">
            <div className="label">{d.about.who}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: whoHtml }} />
          </section>
        )}

        {featured.length > 0 && (
          <section className="about-section rise">
            <div className="about-section-head">
              <div className="label">{d.about.works}</div>
              <Link className="label" href={`${p}/projects/`}>
                {d.about.allProjects} →
              </Link>
            </div>
            <div className="related-grid">
              {featured.map((proj) => (
                <SandCard
                  key={proj.slug}
                  small
                  title={proj.name}
                  titleName={`project-${proj.slug}`}
                  href={`${p}/projects/${slugToHref(proj.slug)}/`}
                  description={lang === "en" ? (proj.description_en ?? proj.description) : proj.description}
                  rows={[
                    { label: d.card.year, value: proj.year },
                    { label: d.card.stack, value: proj.tech.join(" · ") },
                  ]}
                  action={d.card.view}
                />
              ))}
            </div>
          </section>
        )}

        {about.now.length > 0 && (
          <section className="about-section rise">
            <div className="label">{d.about.now}</div>
            <div className="about-now">
              {about.now.map((item) => (
                <SandCard key={item.title} title={item.title} description={item.desc} />
              ))}
            </div>
          </section>
        )}

        {siteHtml && (
          <section className="about-section rise">
            <div className="label">{d.about.site}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: siteHtml }} />
          </section>
        )}

        <section className="about-section rise">
          <div className="label">{d.about.contact}</div>
          {github && (
            <div className="hair-list">
              <HairRow href={github} title="GitHub" sub={github.replace(/^https?:\/\//, "")} trailing="↗" external />
            </div>
          )}
          {contactHtml && <div className="prose" dangerouslySetInnerHTML={{ __html: contactHtml }} />}
        </section>
      </div>
    </div>
  );
}
