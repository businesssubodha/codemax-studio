import services from '../data/services.json';
import { posts, pageCount, archiveUrl } from '../lib/blog';
export function GET() {
 const entries = [
  { path: '/', modified: null },
  { path: '/blog/ai/', modified: null },
  ...services.map(service => ({ path: '/services/' + service.slug + '/', modified: null })),
  ...(posts.length ? [...Array.from({length:pageCount},(_,i) => ({path:archiveUrl(i+1),modified:null})), ...posts.map(post => ({ path: post.path, modified: post.modified }))] : [])
 ];
 const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
 const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...new Map(entries.map(entry => [entry.path, entry])).values()].map(({ path, modified }) => {
  const loc = escapeXml(new URL(path, 'https://codemax.com.au').href);
  const lastmod = modified && /^\d{4}-\d{2}-\d{2}T/.test(modified) ? '<lastmod>' + escapeXml(modified) + '</lastmod>' : '';
  return '<url><loc>' + loc + '</loc>' + lastmod + '</url>';
 }).join('') + '</urlset>';
 return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
