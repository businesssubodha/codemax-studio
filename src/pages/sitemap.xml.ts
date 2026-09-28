import services from '../data/services.json';
export function GET() {
 const paths = ['/', ...services.map(service => '/services/' + service.slug + '/')];
 const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map(path => '<url><loc>https://codemax.com.au' + path + '</loc></url>').join('') + '</urlset>';
 return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
