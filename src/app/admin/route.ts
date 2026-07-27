import { NextResponse } from "next/server";

/**
 * Decap CMS 管理后台
 * 访问 /admin 即可打开文章编辑器
 * config.yml 从 public/admin/config.yml 加载
 */
export async function GET() {
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>管理后台 · 阿九</title>
    <link rel="icon" href="data:," />
    <script src="https://unpkg.com/decap-cms@^3.6.4/dist/decap-cms.js"></script>
  </head>
  <body></body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
