import metadata from '../data/article-image-metadata.json' with { type: 'json' };

// Natural dimensions verified by the image audit, never inferred from the
// template's display crop. Both article path and unchanged source URL must match.
const articles = new Map(Object.entries(metadata).map(([path, images]) => [path, new Map(Object.entries(images))]));
const rawTextElements = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);

export function getArticleImageMetadata(path, src) {
  return articles.get(path)?.get(src);
}

/** Add audited inline dimensions without rewriting source content or other HTML. */
export function addArticleImageDimensions(path, html) {
  if (!articles.has(path)) return html;
  const tokens = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|<\?[^>]*\?>|<\/?([a-z][a-z0-9:-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  const changes = [];
  for (let token; (token = tokens.exec(html));) {
    if (!token[1] || token[0].startsWith('</')) continue;
    const name = token[1].toLowerCase();
    if (name === 'plaintext') break;
    if (rawTextElements.has(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'gi');
      end.lastIndex = tokens.lastIndex;
      if (!end.exec(html)) break;
      tokens.lastIndex = end.lastIndex;
      continue;
    }
    if (name !== 'img') continue;
    const attributes = [...token[0].matchAll(/\s+([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)];
    const sources = attributes.filter(attribute => attribute[1].toLowerCase() === 'src');
    if (sources.length !== 1 || !sources[0][2]) continue;
    // Leave existing dimensions alone, including ambiguous/duplicate attributes.
    if (attributes.some(attribute => /^(width|height)$/i.test(attribute[1]))) continue;
    const src = sources[0][3] ?? sources[0][4] ?? sources[0][5];
    const image = getArticleImageMetadata(path, src);
    if (!image) continue;
    const value = token[0].replace(/(\s*\/?>)$/, ` width="${image.width}" height="${image.height}"$1`);
    changes.push({ start: token.index, end: tokens.lastIndex, value });
  }
  for (let i = changes.length - 1; i >= 0; i--) {
    const { start, end, value } = changes[i];
    html = html.slice(0, start) + value + html.slice(end);
  }
  return html;
}
