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
    const expected = GONGYI_SECTION_ORDER.map((id) => GONGYI_SECTION_HEADINGS[lang][id]);
    assert.deepEqual(headings, expected, file);
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
