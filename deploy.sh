#!/usr/bin/env bash
# 博客一键部署:同步源目录(ext4 构建盘) -> next build -> wrangler pages deploy -> curl 验证
set -euo pipefail

SRC="/media/zenix/文件/Programe/Blog"
BUILD="/home/zenix/blog-build"
SITE="https://404-found.uk"

echo "==> 1/4 同步源目录 -> 构建盘"
rsync -a --delete --exclude=node_modules --exclude=.next --exclude=out "$SRC/" "$BUILD/"

echo "==> 1.5/4 安装依赖(如需)"
cd "$BUILD"
[ -d node_modules ] || npm install

echo "==> 2/4 构建"
rm -rf .next
npm run build

echo "==> 3/4 部署到 Cloudflare Pages (--branch main 生产分支, 否则进 Preview 线上不变)"
source .cf-env
npx wrangler pages deploy out --project-name 0xff-blog --branch main --commit-dirty=true

echo "==> 4/4 验证"
for path in "/" "/blog/" "/tools/" "/about/" "/projects/" "/en/"; do
  code=$(curl -sL -o /dev/null -w "%{http_code}" "$SITE$path")
  echo "  $path -> $code"
done