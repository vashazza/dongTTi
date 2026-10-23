# dongTTi.zip ★

Y2K 메신저 감성의 포트폴리오 겸 기술 블로그. Astro + React islands, GitHub Pages 배포.

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
├─ content.config.ts    ← 글/데이터 스키마 (frontmatter 검사)
├─ layouts/BaseLayout.astro   ← 공통 틀: 상단 상태바 + 페이지 전환 + 하단 바
├─ components/
│  ├─ XpWindow.astro    ← 레트로 OS 창 프레임
│  ├─ Stars.astro       ← 반짝이는 별 장식
│  ├─ Marquee.astro     ← 흐르는 전광판
│  ├─ PostBanner.astro  ← 글 목록 배너
│  ├─ Comments.astro    ← giscus 댓글
│  └─ islands/          ← 움직이는 부분만 React (필요한 곳에서만 JS 로드)
│     ├─ StatusBar.tsx       페이지 넘겨도 유지 (transition:persist)
│     ├─ MessengerLogin.tsx  닉네임 → 상태바 연동
│     ├─ CategoryFilter.tsx  글 카테고리 필터
│     └─ AboutTabs.tsx       about 탭 + 프로젝트 옷장
├─ lib/site.ts          ← 이름, 이메일, 깃헙 등 전역 설정 ★ 여기부터 채우기
├─ pages/               ← index · about · blog/ · blog/[slug] · rss.xml · 404
└─ styles/global.css    ← 색/폰트 토큰 + 광택 버튼 등 Y2K 공통 스타일
```

## 글 쓰기

`src/content/blog/my-post.md`:

```md
---
title: 글 제목
subtitle: 부제 (선택)
date: 2026-10-07
category: study   # paper | study | project
draft: false
readMinutes: 5
---

본문...
```

## 배포 (GitHub Pages)

1. 레포를 만들고 push
2. Settings → Pages → Source를 **GitHub Actions**로
3. `astro.config.mjs`의 `site`를 내 주소로 바꾸기
   - 레포 이름이 `<username>.github.io`면 그대로
   - 다른 이름이면 `base: '/<레포이름>'` 주석 해제
4. `main`에 push하면 `.github/workflows/deploy.yml`이 자동 배포

## TODO

- [ ] `src/lib/site.ts` 이메일·깃헙·핸들 채우기
- [ ] 프로필/폴라로이드 사진 넣기 (`public/` + `MessengerLogin`의 `photo` prop)
- [ ] `about.astro`의 기술 스택을 실제로 써 본 것만으로 정리
- [ ] giscus 설정값 채우기 (`src/components/Comments.astro`)
- [ ] 원본 폰트 교체 (`public/fonts/README.md`)
- [ ] 방문자 카운터 서비스 연결
