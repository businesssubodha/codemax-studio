import data from '../data/blog-posts.json';
export interface BlogPost { path: string; sourceUrl: string; title: string; seoTitle: string; description: string; author: string; published: string; displayDate: string; modified: string | null; categories: string[]; featuredImage?: {url: string; alt: string} | null; html: string; }
export const posts = (data as BlogPost[]).sort((a,b) => b.published.localeCompare(a.published));
export function displayDate(value: string) { return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)); }

export const pageSize = 12;
export const pageCount = Math.ceil(posts.length / pageSize);
export const archiveUrl = (page: number) => page === 1 ? "/blog/" : `/blog/page/${page}/`;
export function relatedPosts(post: BlogPost) {
 const words = (s: string) => new Set((s.toLowerCase().match(/[a-z]{4,}/g) || []).filter(w => !["your", "with", "from", "that", "this", "guide", "australian", "australia", "business", "businesses"].includes(w)));
 const topic = words(post.title);
 return posts.filter(p => p.path !== post.path).map(p => ({post:p, score:[...words(p.title)].filter(w => topic.has(w)).length})).sort((a,b) => b.score-a.score).slice(0,3).map(p => p.post);
}
