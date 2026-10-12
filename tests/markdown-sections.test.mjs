import test from "node:test";
import assert from "node:assert/strict";
import { splitMarkdownSections } from "../src/lib/markdown-sections.ts";

test("按 ## 切分，忽略首个 ## 之前的内容", () => {
  const map = splitMarkdownSections("前言不该出现\n\n## 一\n\n内容一\n\n## 二\n\n内容二\n");
  assert.deepEqual([...map.keys()], ["一", "二"]);
  assert.equal(map.get("一"), "内容一");
  assert.equal(map.get("二"), "内容二");
});

test("### 不算分节，空节返回空串", () => {
  const map = splitMarkdownSections("## 一\n\n### 子标题\n\n正文\n\n## 二\n");
  assert.equal(map.get("一"), "### 子标题\n\n正文");
  assert.equal(map.get("二"), "");
});

test("没有二级标题时返回空 Map", () => {
  assert.equal(splitMarkdownSections("# 只有一级\n\n正文").size, 0);
});
