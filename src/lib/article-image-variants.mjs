import metadata from '../data/article-image-variants.json' with { type: 'json' };

// Locally inspected optimized variants. Exact article and original URL required.
const articles = new Map(Object.entries(metadata).map(([path, images]) => [path, new Map(Object.entries(images))]));
const rawTextElements = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);

export function getArticleImageVariants(path, src) {
  return articles.get(path)?.get(src);
}

/** Swap only audited source URLs; preserve content, dimensions and loading hints. */
export function optimizeArticleImages(path, html) {
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
    // Avoid overwriting responsive choices or ambiguous attributes.
    if (attributes.some(attribute => /^(srcset|sizes)$/i.test(attribute[1]))) continue;
    const src = sources[0][3] ?? sources[0][4] ?? sources[0][5];
    const image = getArticleImageVariants(path, src);
    if (!image) continue;
    const source = sources[0];
    const start = source.index + source[0].indexOf(source[2]);
    const quote = /^["']/.test(source[2]) ? source[2][0] : '';
    const replacement = quote + image.src + quote;
    const replaced = token[0].slice(0, start) + replacement + token[0].slice(start + source[2].length);
    const value = replaced.replace(/(\s*\/?>)$/, ` srcset="${image.srcset}" sizes="${image.sizes}"$1`);
    changes.push({ start: token.index, end: tokens.lastIndex, value });
  }
  for (let i = changes.length - 1; i >= 0; i--) {
    const { start, end, value } = changes[i];
    html = html.slice(0, start) + value + html.slice(end);
  }
  return html;
}
