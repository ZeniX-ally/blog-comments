import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { splitMarkdownSections } from "../src/lib/markdown-sections.ts";
import {
  GONGYI_SECTION_HEADINGS,
  GONGYI_SECTION_ORDER,
} from "../src/lib/gongyi-sections.ts";

const FILES = { zh: "content/gongyi.md", en: "content/en/gongyi.md" };

test("文案里绝不出现公益站域名（硬约束：微信可见范围不露该地址）", () => {
  for (const file of Object.values(FILES)) {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    assert.equal(/wb\.404-found\.uk/.test(raw), false, file);
  }
});

test("两份文案的二级标题与顺序都与分节契约一致", () => {
  for (const [lang, file] of Object.entries(FILES)) {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const headings = [...splitMarkdownSections(raw).keys()];
    // rules 已移出渲染顺序：前面的二级标题依次对应 GONGYI_SECTION_ORDER，
    // 最后一个二级标题是规则书（它由视图渲染为申请区内的可折叠区块）。
    const expectedSections = GONGYI_SECTION_ORDER.map(
      (id) => GONGYI_SECTION_HEADINGS[lang][id],
    );
    assert.deepEqual(
      headings.slice(0, GONGYI_SECTION_ORDER.length),
      expectedSections,
      file,
    );
    assert.equal(
      headings[headings.length - 1],
      GONGYI_SECTION_HEADINGS[lang].rules,
      `${file} 最后一个二级标题应为规则书`,
    );
    assert.equal(
      headings.length,
      GONGYI_SECTION_ORDER.length + 1,
      `${file} 二级标题数量应为分节数 + 1（规则书）`,
    );
  }
});

test("两份文案的规则书标题存在，且该节正文非空（空节会让折叠块消失）", () => {
  for (const [lang, file] of Object.entries(FILES)) {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const sections = splitMarkdownSections(raw);
    const rulesHeading = GONGYI_SECTION_HEADINGS[lang].rules;
    assert.ok(sections.has(rulesHeading), `${file} 缺少规则书标题`);
    assert.ok(sections.get(rulesHeading).trim().length > 0, `${file} 规则书正文为空`);
  }
});

test("两份文案的 frontmatter 都能被解析（曾因未加引号的冒号导致构建失败）", () => {
  for (const file of Object.values(FILES)) {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    let parsed;
    assert.doesNotThrow(() => {
      parsed = matter(raw);
    }, file);
    assert.equal(typeof parsed.data.title, "string", `${file} title`);
    assert.ok(parsed.data.title.length > 0, `${file} title 非空`);
    if (parsed.data.subtitle !== undefined) {
      assert.equal(typeof parsed.data.subtitle, "string", `${file} subtitle`);
    }
    if (parsed.data.description !== undefined) {
      assert.equal(typeof parsed.data.description, "string", `${file} description`);
    }
  }
});
