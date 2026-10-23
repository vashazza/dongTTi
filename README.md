# dongTTi.zip ★

Y2K 메신저 감성의 포트폴리오 겸 기술 블로그. Astro + React islands, GitHub Pages 배포.

🔗 https://vashazza.github.io/dongTTi/

## 시작하기

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 정적 사이트 생성
```

개발 모드(`npm run dev`)에서는 `draft: true` 글도 보이고, 배포 빌드에서는 빠져요.

## 구조

```
src/
├─ content/blog/        ← 블로그 글 (.md / .mdx). 옵시디언 노트를 여기로
├─ data/                ← papers.json · projects.json · awards.json
├─ assets/fonts/        ← 셀프 호스팅 웹폰트 (woff2)
├─ content.config.ts    ← 글/데이터 스키마 (frontmatter 검사)
├─ layouts/BaseLayout.astro   ← 공통 틀: 상단 상태바 + 페이지 전환 + 하단 바
├─ components/
│  ├─ XpWindow.astro    ← 레트로 OS 창 프레임
│  ├─ Stars.astro       ← 반짝이는 별 장식
│  ├─ Marquee.astro     ← 흐르는 전광판
│  ├─ PostBanner.astro  ← 글 목록 배너
│  ├─ Comments.astro    ← giscus 댓글
│  ├─ Pn.astro          ← 고유명사(dongTTi 등)를 스크립트 로고처럼 꾸밈 · 목록은 lib/pn.ts
│  └─ islands/          ← 움직이는 부분만 React (필요한 곳에서만 JS 로드)
│     ├─ StatusBar.tsx       페이지 넘겨도 유지 (transition:persist)
│     ├─ MessengerLogin.tsx  닉네임 → 상태바 연동
│     ├─ CategoryFilter.tsx  글 카테고리 필터
│     └─ AboutTabs.tsx       about 탭 + 프로젝트 옷장
├─ lib/
│  ├─ site.ts           ← 이름, 이메일, 깃헙, 카테고리 이름 등 전역 설정
│  ├─ posts.ts          ← 글 목록(최신순) · 프로젝트별 글 묶기
│  └─ pn.ts             ← 꾸밀 고유명사 목록
├─ pages/               ← index · about · blog/ · blog/[slug] · projects/[id] · rss.xml · 404
└─ styles/
   ├─ global.css        ← 색/폰트 토큰 + 광택 버튼 등 Y2K 공통 스타일
   └─ glitter.css       ← 핑크 테마 배경 반짝이
```

## 글 쓰기

`src/content/blog/my-post.md`:

```md
---
title: 글 제목
subtitle: 부제 (선택)
date: 2026-10-07
category: study   # paper(Paper reviews) | study(Study notes) | project(Project notes)
project: essa     # 선택 · projects.json의 id → /projects/<id> 페이지에 시리즈로 모임
draft: false
readMinutes: 5
---

본문...
```

- 파일 이름이 주소가 돼요: `my-post.md` → `/blog/my-post`
- 빈 줄 없이 엔터 한 번도 줄바꿈으로 보여요 (`remark-breaks`)
- 초안은 이 레포가 공개라서 `.gitignore`에 올려 로컬에만 두고, 공개할 때 빼서 커밋해요

## 배포 (GitHub Pages)

`main`에 push하면 `.github/workflows/deploy.yml`이 빌드해서 자동 배포해요 (Node 24).
레포 이름이 `<username>.github.io`가 아니라서 `astro.config.mjs`에 `base: '/dongTTi'`가 들어가 있어요.
내부 링크는 `lib/site.ts`의 `url()`로 감싸야 base 경로가 붙어요.

## TODO

- [ ] 프로필·폴라로이드 사진 넣기 (`about.astro`, `index.astro`, `MessengerLogin`의 `photo` prop)
- [ ] giscus `repoId`·`categoryId` 채우기 (`src/components/Comments.astro`)
- [ ] 수상 연도 채우기 (`src/data/awards.json`의 devocean, ctech)
- [ ] `about.astro`의 기술 스택을 실제로 써 본 것만으로 정리
- [ ] 방문자 카운터 서비스 연결
