// tests/toc.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { extractToc } from "../src/lib/toc.ts";

test("extracts h2 and h3 with ids and levels", () => {
  const html = `<p>x</p><h2 id="user-content-a">我是谁</h2><p>y</p><h3 id="user-content-b">细节 <code>c</code></h3><h2 id="user-content-c">为什么</h2>`;
  assert.deepEqual(extractToc(html), [
    { id: "user-content-a", text: "我是谁", level: 2 },
    { id: "user-content-b", text: "细节 c", level: 3 },
    { id: "user-content-c", text: "为什么", level: 2 },
  ]);
});

test("returns empty array when there are no headings", () => {
  assert.deepEqual(extractToc("<p>only text</p>"), []);
});

test("skips headings without id", () => {
  assert.deepEqual(extractToc("<h2>no id</h2>"), []);
});
