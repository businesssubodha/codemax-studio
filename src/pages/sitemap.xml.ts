import services from '../data/services.json';
import { posts } from '../lib/blog';
export function GET() {
 const paths = ['/', ...services.map(service => '/services/' + service.slug + '/'), ...(posts.length ? ['/blog/', ...posts.map(post => post.path)] : [])];
 const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...new Set(paths)].map(path => '<url><loc>' + new URL(path, 'https://codemax.com.au').href.replace(/&/g, '&amp;') + '</loc></url>').join('') + '</urlset>';
 return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
