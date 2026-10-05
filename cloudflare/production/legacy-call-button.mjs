// Correct only the confirmed public Call Now Button markup. WordPress's stored
// plugin settings are unchanged; authenticated and application routes bypass it.
export function repairLegacyCallButton(html) {
  const tokens = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|<\?[^>]*\?>|<\/?([a-z][a-z0-9:-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  const raw = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);
  const changes = [];
  for (let token; (token = tokens.exec(html));) {
    if (!token[1] || token[0].startsWith('</')) continue;
    const name = token[1].toLowerCase();
    if (name === 'plaintext') break;
    if (raw.has(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'gi');
      end.lastIndex = tokens.lastIndex;
      if (!end.exec(html)) break;
      tokens.lastIndex = end.lastIndex;
      continue;
    }
    if (name !== 'a') continue;
    const attrs = [...token[0].matchAll(/\s+([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)];
    const find = key => attrs.filter(a => a[1].toLowerCase() === key);
    const ids = find('id'), hrefs = find('href'), classes = find('class');
    if (ids.length !== 1 || hrefs.length !== 1 || classes.length !== 1) continue;
    const value = a => a[3] ?? a[4] ?? a[5];
    if (value(ids[0]) !== 'callnowbutton' || !value(classes[0])?.split(/\s+/).includes('call-now-button') || value(hrefs[0]) !== 'tel:0435 193 756') continue;
    const href = hrefs[0];
    const start = token.index + href.index + href[0].indexOf(href[2]) + 1;
    changes.push({ start, end: start + value(href).length });
  }
  for (const {start, end} of changes.reverse()) html = html.slice(0, start) + 'tel:0494597993' + html.slice(end);
  return html;
}

export async function repairPublicLegacyResponse(request, response) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || !['codemax.com.au', 'www.codemax.com.au'].includes(url.hostname) ||
      url.search || /^\/(?:wp-admin(?:\/|$)|wp-json(?:\/|$)|wp-[^/]*\.php(?:\/|$))/.test(url.pathname) ||
      request.headers.has('Authorization') || /(?:^|;\s*)wordpress_(?:logged_in|sec)_[^=]*=/.test(request.headers.get('Cookie') || '') ||
      ![200, 404].includes(response.status) || !/^text\/html(?:\s*;|$)/i.test(response.headers.get('Content-Type') || '') ||
      response.headers.has('Set-Cookie')) return response;
  const original = await response.clone().text();
  const corrected = repairLegacyCallButton(original);
  if (corrected === original) return response;
  const headers = new Headers(response.headers);
  for (const key of ['Content-Length', 'Content-Encoding', 'Content-MD5', 'ETag', 'Last-Modified', 'Digest', 'Content-Digest', 'Repr-Digest']) headers.delete(key);
  return new Response(corrected, { status: response.status, statusText: response.statusText, headers });
}
