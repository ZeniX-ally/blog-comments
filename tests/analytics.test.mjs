import test from "node:test";
import assert from "node:assert/strict";
import { track } from "../src/lib/analytics.ts";

function withWindow(value, fn) {
  const had = "window" in globalThis;
  const prev = globalThis.window;
  globalThis.window = value;
  try {
    fn();
  } finally {
    if (had) globalThis.window = prev;
    else delete globalThis.window;
  }
}

test("track 在服务端（无 window）静默返回", () => {
  assert.doesNotThrow(() => track("gongyi_apply_success", { source: "test" }));
});

test("track 在没有 umami（脚本没加载或被拦截）时静默返回", () => {
  withWindow({}, () => {
    assert.doesNotThrow(() => track("gongyi_apply_success", { source: "test" }));
  });
});

test("track 把事件名与属性交给 window.umami.track", () => {
  const calls = [];
  withWindow({ umami: { track: (event, data) => calls.push([event, data]) } }, () => {
    track("gongyi_apply_success", { source: "apply-page", retries: 0, ok: true });
  });
  assert.deepEqual(calls, [
    ["gongyi_apply_success", { source: "apply-page", retries: 0, ok: true }],
  ]);
});

test("track 不传属性时只给事件名", () => {
  const calls = [];
  withWindow({ umami: { track: (event, data) => calls.push([event, data]) } }, () => {
    track("gongyi_cta_click");
  });
  assert.deepEqual(calls, [["gongyi_cta_click", undefined]]);
});

test("track 吞掉 umami 抛出的异常，绝不影响主流程", () => {
  withWindow(
    {
      umami: {
        track: () => {
          throw new Error("boom");
        },
      },
    },
    () => {
      assert.doesNotThrow(() => track("gongyi_apply_error", { reason: "network" }));
    },
  );
});

test("track 在 umami 存在但没有 track 方法时也静默返回", () => {
  withWindow({ umami: {} }, () => {
    assert.doesNotThrow(() => track("gongyi_apply_submit", { source: "x" }));
  });
});
