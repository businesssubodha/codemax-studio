import { servicePaths, articlePaths, articleLastModified, assetPaths } from './routes.mjs';
const productionHosts = new Set(['codemax.com.au', 'www.codemax.com.au']);
const wordpressQueryKeys = ['p', 'page_id', 'attachment_id', 'preview', 'preview_id', 'preview_nonce', 'rest_route', 'feed', 's', 'author', 'cat', 'tag', 'paged', 'post_type', 'customize_changeset_uuid'];

export function studioPath(request) {
  const url = new URL(request.url);
  if (!productionHosts.has(url.hostname) || !['GET', 'HEAD'].includes(request.method)) return null;
  if (wordpressQueryKeys.some(key => url.searchParams.has(key))) return null;
  if (/(?:^|;\s*)wordpress_logged_in_[^=]*=/.test(request.headers.get('Cookie') || '')) return null;
  if (url.pathname === '/') return '/';
  if (url.pathname === '/robots.txt') return url.pathname;
  const normalized = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
  if (servicePaths.has(normalized)) return normalized;
  if (articlePaths.has(normalized)) return normalized;
  if (assetPaths.has(url.pathname)) return url.pathname;
  if (/^\/_astro\/[^/]+\.(?:js|css)$/.test(url.pathname)) return url.pathname;
  // Keep the original WordPress sitemap and robots endpoints untouched.
  if (url.pathname === '/studio-sitemap.xml') return url.pathname;
  return null;
}

export async function handleRequest(request, env, fetcher = fetch) {
  const path = studioPath(request);
  // fetch(original request) on a Worker Route goes to the existing DNS origin.
  // Never attach this Worker as a Custom Domain; WordPress remains the origin.
  if (env.ENABLED !== 'true' || path === null) return fetcher(request);
  let origin;
  try {
    origin = new URL(env.PAGES_ORIGIN);
    if (origin.protocol !== 'https:' || !/^[a-z0-9-]+\.pages\.dev$/.test(origin.hostname) || origin.username || origin.password || origin.port || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid Pages origin');
  } catch {
    return fetcher(request);
  }
  const incoming = new URL(request.url);
  if (incoming.pathname === '/robots.txt') {
    const upstreamRequest = new Request(incoming, {
      method: 'GET',
      headers: { Accept: 'text/plain, */*' }
    });
    let upstream;
    try {
      upstream = await fetcher(upstreamRequest);
    } catch {
      return fetcher(request);
    }
    if (!upstream.ok) return fetcher(request);
    let body;
    try {
      body = await upstream.text();
    } catch {
      return fetcher(request);
    }
    const studioSitemap = 'Sitemap: https://codemax.com.au/studio-sitemap.xml';
    if (!/^Sitemap:\s*https:\/\/codemax\.com\.au\/studio-sitemap\.xml\s*$/im.test(body)) {
      body = body.replace(/\s*$/, '') + '\n' + studioSitemap + '\n';
    }
    const headers = new Headers(upstream.headers);
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=300');
    for (const key of ['Content-Length', 'Content-Encoding', 'Content-MD5', 'ETag', 'Last-Modified']) headers.delete(key);
    return new Response(request.method === 'HEAD' ? null : body, { status: upstream.status, headers });
  }
  if (incoming.hostname === 'www.codemax.com.au' && incoming.pathname === '/studio-sitemap.xml') {
    const canonical = new URL(incoming);
    canonical.hostname = 'codemax.com.au';
    return new Response(null, { status: 308, headers: { Location: canonical.href } });
  }
  // Serve the submitted sitemap directly from the production router. This
  // removes a second-host dependency from Google's sitemap fetch and keeps
  // WordPress's existing sitemap.xml and sitemap_index.xml untouched.
  if (incoming.pathname === '/studio-sitemap.xml') {
    const entries = [
      ...['/', ...servicePaths].map(path => ({ path, modified: null })),
      ...[...articlePaths].map(path => ({ path, modified: articleLastModified.get(path) }))
    ];
    const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const body = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      entries.map(({ path, modified }) => {
        const loc = escapeXml(new URL(path, 'https://codemax.com.au').href);
        const lastmod = modified && /^\d{4}-\d{2}-\d{2}T/.test(modified) ? `<lastmod>${escapeXml(modified)}</lastmod>` : '';
        return `<url><loc>${loc}</loc>${lastmod}</url>`;
      }).join('') +
      '</urlset>';
    return new Response(request.method === 'HEAD' ? null : body, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-CodeMax-Site': 'studio'
      }
    });
  }
  const target = new URL(path, origin);
  // Static content does not need visitor cookies, auth, form data or query strings.
  const headers = new Headers();
  for (const key of ['Accept', 'If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) {
    if (request.headers.has(key)) headers.set(key, request.headers.get(key));
  }
  let upstream;
  try {
    upstream = await fetcher(new Request(target, { method: request.method, headers, redirect: 'manual', signal: AbortSignal.timeout(10000) }));
  } catch {
    return fetcher(request);
  }
  // Fail back to the original site if the Pages deployment is unavailable.
  if (!(upstream.ok || upstream.status === 304)) return fetcher(request);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('X-Robots-Tag');
  responseHeaders.delete('Set-Cookie');
  responseHeaders.set('X-CodeMax-Site', 'studio');
  // Use the same canonical hostname and slash convention as the Astro pages.
  if (incoming.hostname === 'www.codemax.com.au' || (servicePaths.has(path) && incoming.pathname !== path)) {
    const canonical = new URL(incoming);
    canonical.hostname = 'codemax.com.au';
    canonical.pathname = path;
    return new Response(null, { status: 308, headers: { Location: canonical.href } });
  }
  return new Response(request.method === 'HEAD' ? null : upstream.body, { status: upstream.status, headers: responseHeaders });
}

export default { fetch(request, env) { return handleRequest(request, env); } };
