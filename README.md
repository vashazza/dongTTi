# dongTTi.zip ★

개인 포트폴리오 겸 기술 블로그.
의료 AI · LLM 서빙 연구 기록과 논문 리뷰, 프로젝트 노트를 모아 둔다.

🔗 <https://vashazza.github.io/dongTTi/>

## Stack

- **Astro 7** — 정적 사이트 생성, Content Collections로 글·데이터 스키마 검증
- **React islands** — 상태바, 메신저 로그인, 카테고리 필터, about 탭 등 인터랙션이 필요한 부분만 hydrate
- **View Transitions** — 페이지 전환 시 상단 상태바 유지 (`transition:persist`)
- **Markdown / MDX** — `remark-breaks` · `remark-cjk-friendly`로 한국어 글 렌더링 보정
- **giscus** — GitHub Discussions 기반 댓글
- **GitHub Actions → GitHub Pages** 자동 배포

## Features

- 카테고리별 블로그 (Paper reviews · Study notes · Project notes)와 클라이언트 필터
- 프로젝트별 글 시리즈 페이지 (`/projects/[id]`) — 글 frontmatter의 `project` 참조로 자동 연결
- about 페이지: 논문 · 프로젝트 · 수상 · 기술 스택 탭
- RSS, sitemap, draft 글은 배포 빌드에서 제외
- 셀프 호스팅 웹폰트, `prefers-reduced-motion` 대응

## Structure

```text
src/
├─ content/blog/       블로그 글 (.md / .mdx)
├─ data/               papers · projects · awards (JSON)
├─ content.config.ts   글·데이터 스키마
├─ layouts/            공통 레이아웃 (상태바 · 페이지 전환 · 푸터)
├─ components/         XP 창 프레임, 글 배너, 댓글 등
│  └─ islands/         React 컴포넌트
├─ lib/                전역 설정, 글 정렬·그룹핑, 고유명사 스타일링
├─ pages/              index · about · blog · projects · rss · 404
├─ styles/             디자인 토큰, Y2K 컴포넌트 스타일
└─ assets/fonts/       woff2 웹폰트
```

## Development

```bash
npm install
npm run dev      # http://localhost:4321/dongTTi/
npm run build    # dist/
```

Node 22.12 이상 필요.

## Writing a post

`src/content/blog/<slug>.md`

```md
---
title: 글 제목
subtitle: 부제            # optional
date: 2026-10-07
category: study           # paper | study | project
project: essa             # optional, data/projects.json id
draft: false
---
```
