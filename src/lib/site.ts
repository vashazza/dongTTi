// 사이트 전역 설정 — 여기만 고치면 전체에 반영돼요
export const SITE = {
  title: 'dongTTi.zip',
  author: '박동초 (Dongcho Park)',
  description: '의료 AI × LLM 서빙을 공부하는 dongTTi의 포트폴리오 겸 블로그',
  email: 'ewecho0219@gmail.com',
  github: 'https://github.com/vashazza',
  handle: '@vashazza',
};

export const CATEGORY_LABEL = {
  paper: 'Paper reviews',
  study: 'Study notes',
  project: 'Project notes',
} as const;

export type Category = keyof typeof CATEGORY_LABEL;

/** base 경로(GitHub Pages 프로젝트 레포일 때)를 붙여주는 헬퍼 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
