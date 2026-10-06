// tests/i18n.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { switchPath, getLangFromPath, dict } from "../src/lib/i18n.ts";

test("switchPath", () => {
  assert.equal(switchPath("/", "en"), "/en/");
  assert.equal(switchPath("/blog/a/", "en"), "/en/blog/a/");
  assert.equal(switchPath("/en/blog/a/", "zh"), "/blog/a/");
  assert.equal(switchPath("/en/", "zh"), "/");
});

test("getLangFromPath", () => {
  assert.equal(getLangFromPath("/en/about/"), "en");
  assert.equal(getLangFromPath("/about/"), "zh");
});

function keys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

test("zh and en dictionaries have identical key sets", () => {
  assert.deepEqual(keys(dict.zh).sort(), keys(dict.en).sort());
});
