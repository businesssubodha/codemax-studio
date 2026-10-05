import data from '../data/blog-posts.json';
import editorial from '../data/editorial-posts.json';
import { publicModifiedDate } from './article-dates.mjs';
import { repairLegacyLinks } from './repair-legacy-links.mjs';
import { repairArticleHeadings } from './article-heading-repairs.mjs';
import { repairArticleListBreaks } from './article-list-break-repairs.mjs';
export interface BlogPost { path: string; sourceUrl: string; title: string; seoTitle: string; description: string; author: string; published: string; displayDate: string; modified: string | null; categories: string[]; featuredImage?: {url: string; alt: string} | null; html: string; }
// Keep old imports usable while the WordPress export is reviewed and corrected.
// Only map addresses with an unambiguous live destination.
const legacyContentLinks: Record<string, string> = {
 '/contact/': '/#enquiry', '/services/': '/#services',
 '/website_9b0af0dc/': '/', '/website_9b0af0dc/blog/': '/blog/',
 '/website_9b0af0dc/services/': '/#services', '/about/': '/#about',
 '/about-us/': '/#about', '/web-design/': '/services/web-design-melbourne/',
 '/blog/exploring-the-latest-innovations-in-ai-technologies/': '/exploring-latest-innovations-in-ai-technologies/',
 '/blog/wordpress-management-services-by-codemax/': '/wordpress-management-services-by-codemax/',
 '/blog/melbourne-wordpress-management-services/': '/melbourne-wordpress-management-services/',
 '/modern-website-redesign-boost-business-drive-growth/': '/website-redesign-drives-growth/'
};
function cleanArticleHtml(html: string) {
 return repairLegacyLinks(html).replace(/<p>\s*\[YOUTUBE:\s*https?:\/\/(?:www\.)?youtube\.com\/watch\?v=ABCDEFGHI\s*\]\s*<\/p>/gi, '')
  .replace(/href="([^"]+)"/g, (attribute, value: string) => {
   // One legacy embed was imported as href="&lt;div style=". Keep its
   // readable content/video link without exposing a markup fragment as a URL.
   if (/[<>]|&(?:lt|gt|quot);|&#(?:0*(?:34|60|62)|x0*(?:22|3c|3e));/i.test(value)) return '';
   let url: URL;
   try { url = new URL(value, 'https://codemax.com.au'); } catch { return attribute; }
   if (url.hostname !== 'codemax.com.au' && url.hostname !== 'www.codemax.com.au') return attribute;
   const replacement = legacyContentLinks[url.pathname.endsWith('/') ? url.pathname : url.pathname + '/'];
   if (!replacement || url.search) return attribute;
   return `href="https://codemax.com.au${replacement}${url.hash && !replacement.includes('#') ? url.hash : ''}"`;
  });
}
export const posts = ([...data, ...editorial] as BlogPost[]).map(post => ({ ...post, modified: publicModifiedDate(post.published, post.modified), html: repairArticleListBreaks(post.path, repairArticleHeadings(post.path, cleanArticleHtml(post.html))) })).sort((a,b) => b.published.localeCompare(a.published));
export function displayDate(value: string) { return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)); }

export const pageSize = 12;
export const pageCount = Math.ceil(posts.length / pageSize);
export const archiveUrl = (page: number) => page === 1 ? "/blog/" : `/blog/page/${page}/`;
export function relatedPosts(post: BlogPost) {
 const words = (s: string) => new Set((s.toLowerCase().match(/[a-z]{4,}/g) || []).filter(w => !["your", "with", "from", "that", "this", "guide", "australian", "australia", "business", "businesses"].includes(w)));
 const topic = words(post.title);
 return posts.filter(p => p.path !== post.path).map(p => ({post:p, score:[...words(p.title)].filter(w => topic.has(w)).length})).sort((a,b) => b.score-a.score).slice(0,3).map(p => p.post);
}

// Only published content belongs in the AI section.
export const aiPosts = posts.filter(post => /\bAI\b|artificial intelligence|chatgpt|generative/i.test(post.title) || post.categories.some(category => /^(AI|Artificial Intelligence)$/i.test(category)));
