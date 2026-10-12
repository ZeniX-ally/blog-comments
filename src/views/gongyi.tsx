import { Stagger } from "@/components/stagger";
import { ApplyForm } from "@/components/apply-form";
import { GongyiCta } from "@/components/gongyi-cta";
import { dict, type Lang } from "@/lib/i18n";
import { GONGYI_SECTION_HEADINGS, GONGYI_SECTION_ORDER } from "@/lib/gongyi-sections";
import type { GongyiContent } from "@/lib/gongyi-content";

type GongyiViewProps = {
  lang: Lang;
  content: GongyiContent;
};

/**
 * 公益页：页头（label + h1 + 导语 + 申请锚点按钮）→ 四个分节（markdown 渲染）
 * → 申请表单 → 隐私说明。分节的标题原文由 GONGYI_SECTION_HEADINGS 给出，
 * 界面标签取自 dict.gongyi，两者分开，改界面文案不会让某一节消失。
 */
export function GongyiView({ lang, content }: GongyiViewProps) {
  const d = dict[lang].gongyi;
  const headings = GONGYI_SECTION_HEADINGS[lang];
  const labels = { what: d.what, gain: d.gain, how: d.how, rules: d.rules };

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.label}</div>
          <h1 className="reveal">{content.title}</h1>
          {content.subtitle && <p className="lede reveal">{content.subtitle}</p>}
          <div className="pill-row reveal">
            <GongyiCta href="#apply" label={d.cta} />
          </div>
        </Stagger>
      </header>

      <div className="page-body">
        {GONGYI_SECTION_ORDER.map((id) => {
          const html = content.sectionsHtml[headings[id]] ?? "";
          if (!html) return null;
          return (
            <section key={id} className="about-section rise">
              <div className="label">{labels[id]}</div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
            </section>
          );
        })}

        <section id="apply" className="about-section rise">
          <div className="label">{d.form.label}</div>
          <ApplyForm lang={lang} />
        </section>

        <p className="label rise">{d.form.privacy}</p>
      </div>
    </div>
  );
}
