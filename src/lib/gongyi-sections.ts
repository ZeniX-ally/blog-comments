/**
 * 公益页的分节契约：markdown 的 `##` 标题与界面标签的对应关系。
 * 单独放一个零依赖模块，node:test 才能加载它，去校验两份文案的标题与顺序。
 */
import type { Lang } from "./i18n";

export type GongyiSectionId = "what" | "gain" | "how" | "rules";

/** 顺序即页面渲染顺序 */
export const GONGYI_SECTION_ORDER: GongyiSectionId[] = ["what", "gain", "how", "rules"];

/** 各语言下，一个分节 id 对应 markdown 里 `## ` 标题的原文 */
export const GONGYI_SECTION_HEADINGS: Record<Lang, Record<GongyiSectionId, string>> = {
  zh: { what: "这是什么", gain: "能拿到什么", how: "怎么用", rules: "边界与规则" },
  en: { what: "What this is", gain: "What you get", how: "How it works", rules: "Rules" },
};
