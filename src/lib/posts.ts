import { getCollection } from 'astro:content';

/** 배포 빌드에서는 draft 글을 빼고, 개발 중에는 보여줘요. 최신순. */
export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** 프로젝트 id → 그 프로젝트에 연결된 글 목록 (오래된 순 = 시리즈 순서) */
export async function getPostsByProject() {
  const map = new Map<string, Awaited<ReturnType<typeof getPosts>>>();
  for (const post of (await getPosts()).reverse()) {
    const id = post.data.project?.id;
    if (!id) continue;
    map.set(id, [...(map.get(id) ?? []), post]);
  }
  return map;
}
