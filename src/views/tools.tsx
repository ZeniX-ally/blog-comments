import { Stagger } from "@/components/stagger";
import { dict, type Lang } from "@/lib/i18n";
import type { ToolSection } from "@/lib/tools";

/**
 * 工具页:标签 + h1 + 导语(出场编排)→ 每个分区:mono 英文名 + h2 中文名 + 细线行(.rise)。
 * 工具行没有链接,所以不用 HairRow(它要求 href),直接按 .hair-row 的结构写:
 * 左 .label 状态词(RUNNING / LOCAL / LAB / DAILY)、中 名称 + 说明、右 .label tag。
 * 数据来自 lib/tools 的 TOOL_SECTIONS[lang],由壳传入。
 */
export function ToolsView({ lang, sections }: { lang: Lang; sections: ToolSection[] }) {
  const d = dict[lang];

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.tools.label}</div>
          <h1 className="reveal">{d.tools.title}</h1>
          <p className="lede reveal">{d.tools.sub}</p>
        </Stagger>
      </header>
      <div className="tools-list">
        {sections.map((sec) => (
          <section key={sec.en} className="tool-section rise">
            <div className="label">{sec.en}</div>
            <h2>{sec.title}</h2>
            <div className="hair-list">
              {sec.tools.map((tool) => (
                <div key={tool.name} className="hair-row tool-row">
                  <span className="label">{tool.status}</span>
                  <span>
                    <span className="hair-row-title">{tool.name}</span>
                    <span className="hair-row-sub">{tool.desc}</span>
                  </span>
                  <span className="label">{tool.tag}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
