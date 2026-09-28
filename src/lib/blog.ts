import data from '../data/blog-posts.json';
export interface BlogPost { path: string; sourceUrl: string; title: string; seoTitle: string; description: string; author: string; published: string; displayDate: string; modified: string | null; categories: string[]; html: string; }
export const posts = (data as BlogPost[]).sort((a,b) => b.published.localeCompare(a.published));
export function displayDate(value: string) { return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)); }
