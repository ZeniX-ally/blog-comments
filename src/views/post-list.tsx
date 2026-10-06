import { Stagger } from "@/components/stagger";
import { HairRow } from "@/components/hair-row";
import { PostSearch } from "@/components/post-search";
import { dict, type Lang } from "@/lib/i18n";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";

/** 按年份分组,年份新的在前(posts 已按日期倒序) */
function groupByYear(posts: PostMeta[]): [string, PostMeta[]][] {
  const groups = new Map<string, PostMeta[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

/**
 * 文章行列表:日期 / 标题(+摘要) / 标签 的细线行。
 * 标题带 post-${slug} 共享元素名,与文章页 h1 morph。列表页与标签页共用。
 */
export function PostRows({ lang, posts }: { lang: Lang; posts: PostMeta[] }) {
  const p = lang === "en" ? "/en" : "";
  return (
    <div className="hair-list">
      {posts.map((post) => (
        <HairRow
          key={post.slug}
          href={`${p}/blog/${slugToHref(post.slug)}/`}
          meta={formatDate(post.date)}
          title={post.title}
          titleName={`post-${post.slug}`}
          sub={post.excerpt}
          trailing={post.tags.join(" · ")}
        />
      ))}
    </div>
  );
}

/**
 * 文章列表页:标签 + h1(出场编排)→ 搜索框 → 按年分组的细线行(.rise)。
 * 年份分组作为 children 交给 PostSearch,有搜索词时由它换成结果行。
 */
export function PostListView({ lang, posts }: { lang: Lang; posts: PostMeta[] }) {
  const d = dict[lang];
  const groups = groupByYear(posts);

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.blog.label(posts.length)}</div>
          <h1 className="reveal">{d.blog.title}</h1>
        </Stagger>
      </header>
      <div className="page-body">
        {posts.length === 0 ? (
          <p className="lede">{d.blog.empty}</p>
        ) : (
          <PostSearch posts={posts} lang={lang}>
            {groups.map(([year, list]) => (
              <section key={year} className="year-group rise">
                <div className="label">{d.blog.year(year, list.length)}</div>
                <PostRows lang={lang} posts={list} />
              </section>
            ))}
          </PostSearch>
        )}
      </div>
    </div>
  );
}
