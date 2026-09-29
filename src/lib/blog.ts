import data from '../data/blog-posts.json';
import editorial from '../data/editorial-posts.json';
export interface BlogPost { path: string; sourceUrl: string; title: string; seoTitle: string; description: string; author: string; published: string; displayDate: string; modified: string | null; categories: string[]; featuredImage?: {url: string; alt: string} | null; html: string; }
// Keep old imports usable while the WordPress export is reviewed and corrected.
// Only map addresses with an unambiguous live destination.
const legacyContentLinks: Record<string, string> = {
 '/contact/': '/#enquiry', '/services/': '/#services',
 '/website_9b0af0dc/': '/', '/website_9b0af0dc/blog/': '/blog/',
 '/website_9b0af0dc/services/': '/#services', '/about/': '/#about',
 '/about-us/': '/#about', '/web-design/': '/services/web-design-melbourne/',
 '/modern-website-redesign-boost-business-drive-growth/': '/website-redesign-drives-growth/'
};
function cleanArticleHtml(html: string) {
 return html.replace(/<p>\s*\[YOUTUBE:\s*https?:\/\/(?:www\.)?youtube\.com\/watch\?v=ABCDEFGHI\s*\]\s*<\/p>/gi, '')
  .replace(/href="([^"]+)"/g, (attribute, value: string) => {
   let url: URL;
   try { url = new URL(value, 'https://codemax.com.au'); } catch { return attribute; }
   if (url.hostname !== 'codemax.com.au' && url.hostname !== 'www.codemax.com.au') return attribute;
   const replacement = legacyContentLinks[url.pathname.endsWith('/') ? url.pathname : url.pathname + '/'];
   if (!replacement || url.search) return attribute;
   return `href="https://codemax.com.au${replacement}${url.hash && !replacement.includes('#') ? url.hash : ''}"`;
  });
}
export const posts = ([...data, ...editorial] as BlogPost[]).map(post => ({ ...post, html: cleanArticleHtml(post.html) })).sort((a,b) => b.published.localeCompare(a.published));
export function displayDate(value: string) { return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)); }

export const pageSize = 12;
export const pageCount = Math.ceil(posts.length / pageSize);
export const archiveUrl = (page: number) => page === 1 ? "/blog/" : `/blog/page/${page}/`;
export function relatedPosts(post: BlogPost) {
 const words = (s: string) => new Set((s.toLowerCase().match(/[a-z]{4,}/g) || []).filter(w => !["your", "with", "from", "that", "this", "guide", "australian", "australia", "business", "businesses"].includes(w)));
 const topic = words(post.title);
 return posts.filter(p => p.path !== post.path).map(p => ({post:p, score:[...words(p.title)].filter(w => topic.has(w)).length})).sort((a,b) => b.score-a.score).slice(0,3).map(p => p.post);
}
