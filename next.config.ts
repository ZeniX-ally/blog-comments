import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // 全部使用默认配置(Turbopack)。需要自定义时在这里扩展。
};

export default nextConfig;
