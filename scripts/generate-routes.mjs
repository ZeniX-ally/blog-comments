#!/usr/bin/env node
/**
 * 生成 out/_routes.json：把 Pages Functions 限定在 /api/*。
 * 没有这个文件时，加了 Functions 的项目会让所有静态请求也走 Function，
 * 静态页面的无限免费额度就没了。在 next build 之后运行。
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");

if (!fs.existsSync(OUT)) {
  console.error("❌ out/ 不存在，先跑 next build");
  process.exit(1);
}

const routes = { version: 1, include: ["/api/*"], exclude: [] };
fs.writeFileSync(path.join(OUT, "_routes.json"), `${JSON.stringify(routes, null, 2)}\n`);
console.log("✅ _routes.json → include /api/*");
