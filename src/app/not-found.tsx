import { PageTransition } from "@/components/page-transition";
import { NotFoundView } from "@/views/not-found";

/** 404 页:静态导出只有一个 404.html,固定中文 */
export default function NotFound() {
  return (
    <PageTransition>
      <NotFoundView lang="zh" />
    </PageTransition>
  );
}
