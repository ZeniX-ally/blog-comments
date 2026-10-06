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

  /** 首页文案(zh / en);headline 每个元素一行,{...} 包住的词渲染为下划线词 */
  home: {
    zh: {
      headline: ["I'm {Zenix}.", "Test engineer who", "cares about {clean text}."],
      lede: ["你好，我是阿九，一名测试工程师。在产线测试这条路上摸爬滚打，目前的方向是测试研发——FCT / IGBT 测试、上位机自动化。", "这里记录工作与学习中的踩坑、对测试和自动化的思考，和偶尔的生活碎片。"],
      statement: "想清楚一件事和写清楚一件事是两回事。我写不了多快，但每一篇都想明白了再落笔。",
    },
    en: {
      headline: ["I'm {Zenix}.", "Test engineer who", "cares about {clean text}."],
      lede: ["Hi, I'm Zenix, a test engineer working on FCT / IGBT test systems and host-side automation.", "This site keeps notes from work and study, thoughts on testing and automation, and the occasional slice of life."],
      statement: "Understanding something and writing it down clearly are two different things. I don't write fast, but nothing goes out before I've thought it through.",
    },
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
