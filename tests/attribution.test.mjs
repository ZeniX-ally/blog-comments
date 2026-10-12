import test from "node:test";
import assert from "node:assert/strict";
import {
  currentAttribution,
  readAttribution,
  rememberAttribution,
} from "../src/lib/attribution.ts";

const KEY = "gongyi.attribution";
const DAY = 24 * 60 * 60 * 1000;

/** 极简 localStorage 替身，node 里没有这个全局对象 */
function stubStorage() {
  const map = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
    },
    configurable: true,
    writable: true,
  });
  return map;
}

test("rememberAttribution：首次写入并原样返回", () => {
  stubStorage();
  const now = 1000000;
  assert.deepEqual(rememberAttribution({ source: "v2ex", ref: "tieba.baidu.com" }, now), {
    source: "v2ex",
    ref: "tieba.baidu.com",
  });
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).ts, now);
});

test("rememberAttribution：first touch 不被后续覆盖", () => {
  stubStorage();
  const now = 1000000;
  rememberAttribution({ source: "v2ex", ref: "tieba.baidu.com" }, now);
  assert.deepEqual(rememberAttribution({ source: "other", ref: "example.com" }, now + DAY), {
    source: "v2ex",
    ref: "tieba.baidu.com",
  });
});

test("readAttribution：超过 30 天视为过期", () => {
  stubStorage();
  const now = 1000000;
  rememberAttribution({ source: "v2ex", ref: "" }, now);
  assert.deepEqual(readAttribution(now + 29 * DAY), { source: "v2ex", ref: "" });
  assert.equal(readAttribution(now + 31 * DAY), null);
});

test("readAttribution：缺失与损坏数据都不抛错", () => {
  stubStorage();
  assert.equal(readAttribution(0), null);
  globalThis.localStorage.setItem(KEY, "{不是 json");
  assert.equal(readAttribution(0), null);
  globalThis.localStorage.setItem(KEY, JSON.stringify({ source: "x" }));
  assert.equal(readAttribution(0), null);
});

test("currentAttribution：没有记录时返回空来源", () => {
  stubStorage();
  assert.deepEqual(currentAttribution(0), { source: "", ref: "" });
});
