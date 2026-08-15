/**
 * 全站配置 —— 把这里改成你自己的信息即可。
 * 这是唯一需要修改的"配置文件"，页面文案大多从这里读取。
 */
export const site = {
  /** 站点名，显示在左上角导航与标题里 */
  name: "阿九",
  /** 浏览器标签页标题 */
  title: "阿九 · 个人站",
  /** 站点描述，用于 SEO 与 RSS */
  description: "测试工程师，记录生活与学习中的所思所想。",
  /** 线上域名(部署后替换，用于 sitemap / RSS / 分享链接) */
  url: "https://404-found.uk",

  /** 首页 Hero */
  hero: {
    greeting: "I'm Ajiu.",
    bio: [
      "Test engineer in test R&D.",
      "Minimal design. Clean text. Perfectionist.",
    ],
  },

  /** 社交与联系方式(留空字符串则不显示) */
  links: {
    github: "https://github.com/ZeniX-ally",
    email: "",
    rss: "/feed.xml",
  },

  /** Giscus 评论(https://giscus.app 上配置后填入;为空则不显示评论区) */
  giscus: {
    repo: "ZeniX-ally/blog-comments", // 格式: "owner/repo"
    repoId: "R_kgDOTzB8hA",
    category: "Announcements",
    categoryId: "DIC_kwDOTzB8hM4DC_Ns",
    lang: "zh-CN",
  },

  /** Umami 统计(自托管或云版;scriptSrc 为空则不加载) */
  umami: {
    scriptSrc: "https://cloud.umami.is/script.js",
    websiteId: "6444ccf5-d4e7-4df4-a9a8-d4204141db58",
  },
} as const;

export type Site = typeof site;
