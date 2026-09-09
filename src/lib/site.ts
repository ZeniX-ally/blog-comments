/**
 * 全站配置 —— 把这里改成你自己的信息即可。
 * 这是唯一需要修改的"配置文件"，页面文案大多从这里读取。
 * name/title/description/url 与 scripts 共用 site-core.json。
 */
import siteCore from "./site-core.json";

export const site = {
  ...siteCore,

  /** 首页 Hero */
  hero: {
    greeting: "I'm Zenix.",
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
