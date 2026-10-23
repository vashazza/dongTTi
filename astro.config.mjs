// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';
import remarkCjkFriendly from 'remark-cjk-friendly';

// GitHub Pages:
// - repo named <username>.github.io  → site: 'https://<username>.github.io', no base
// - any other repo name (e.g. dongti-zip) → also set base: '/dongti-zip'
export default defineConfig({
  site: 'https://vashazza.github.io',
  base: '/dongTTi',
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    // velog·옵시디언처럼 줄바꿈 한 번도 줄바꿈으로 보이게 + 한글 바로 앞뒤의 **굵게**도 제대로 인식
    // (Astro 7 기본 처리기 Sätteri엔 이 기능이 없어서 remark 기반 unified 처리기를 씀)
    processor: unified({
      remarkPlugins: [remarkBreaks, remarkCjkFriendly],
      smartypants: false,
    }),
    shikiConfig: { theme: 'github-dark' },
  },
});
