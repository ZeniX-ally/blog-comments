import { Stagger } from "@/components/stagger";
import { HairRow } from "@/components/hair-row";
import { dict, type Lang } from "@/lib/i18n";
import { slugToHref, type PostMeta } from "@/lib/posts";
import { PostRows } from "@/views/post-list";

/** 标签总览 /tags:标签 + h1 → 细线行(标签名 / 右侧计数) */
export function TagsView({ lang, tags }: { lang: Lang; tags: { tag: string; count: number }[] }) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.tags.label}</div>
          <h1 className="reveal">{d.tags.title}</h1>
        </Stagger>
      </header>
      <div className="page-body">
        {tags.length === 0 ? (
          <p className="lede">{d.tags.empty}</p>
        ) : (
          <div className="hair-list">
            {tags.map(({ tag, count }) => (
              <HairRow key={tag} href={`${p}/tags/${slugToHref(tag)}/`} title={tag} trailing={d.tags.count(count)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 单个标签 /tags/[tag]:标签 + h1 #tag + 篇数导语 → 与文章列表相同的行 */
export function TagView({ lang, tag, posts }: { lang: Lang; tag: string; posts: PostMeta[] }) {
  const d = dict[lang];

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.tags.label}</div>
          <h1 className="reveal">#{tag}</h1>
          <p className="lede reveal">{d.tags.tagLabel(posts.length)}</p>
        </Stagger>
      </header>
      <div className="page-body">
        <PostRows lang={lang} posts={posts} />
      </div>
    </div>
  );
}
