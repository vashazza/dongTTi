import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts: write .md/.mdx in src/content/blog (Obsidian notes drop in here)
const blog = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/_*/**'], base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    category: z.enum(['paper', 'study', 'project']),
    draft: z.boolean().default(false),
    readMinutes: z.number().optional(),
    // 이 글이 어느 프로젝트 이야기인지 (projects.json의 id). 없는 id를 쓰면 빌드가 알려줘요.
    project: reference('projects').optional(),
  }),
});

const papers = defineCollection({
  loader: file('./src/data/papers.json'),
  schema: z.object({
    title: z.string(),
    role: z.enum(['1st', '2nd', '3rd', 'co']),
    venue: z.string(),
    status: z.enum(['published', 'under-review', 'preprint']),
    note: z.string(),
    link: z.string().url().optional(),
    order: z.number(),
  }),
});

const projects = defineCollection({
  loader: file('./src/data/projects.json'),
  schema: z.object({
    no: z.string(),
    tag: z.string(),
    name: z.string(),
    desc: z.string(),
    stack: z.array(z.string()),
    link: z.string().url().optional(),
    upcoming: z.boolean().default(false),
  }),
});

const awards = defineCollection({
  loader: file('./src/data/awards.json'),
  schema: z.object({ prize: z.string(), name: z.string(), year: z.number().optional() }),
});

export const collections = { blog, papers, projects, awards };
