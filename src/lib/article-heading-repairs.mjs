import audit from '../data/article-heading-repairs.json' with { type: 'json' };

const articles = new Set(audit.articles.map(article => article.path));
const rawTextElements = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);

/**
 * Correct the outline of the exact audited articles without rewriting their
 * source records, text, attributes, IDs or unrelated markup. Every H3 becomes
 * H2 and every H4 becomes H3; the original level preserves their typography.
 */
export function repairArticleHeadings(path, html) {
  if (!articles.has(path)) return html;
  const tokens = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|<\?[^>]*\?>|<\/?([a-z][a-z0-9:-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  const changes = [];
  const open = [];
  let firstLevel;
  for (let token; (token = tokens.exec(html));) {
    if (!token[1]) continue;
    const name = token[1].toLowerCase();
    const closing = token[0].startsWith('</');
    if (!closing && name === 'plaintext') break;
    if (!closing && rawTextElements.has(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'gi');
      end.lastIndex = tokens.lastIndex;
      if (!end.exec(html)) break;
      tokens.lastIndex = end.lastIndex;
      continue;
    }
    if (!/^h[1-6]$/.test(name)) continue;
    const level = Number(name[1]);
    // An edited/previously repaired article is no longer this audited shape.
    // Fail closed rather than flattening newly authored sections or changing
    // a partially repaired outline. The built-page check flags remaining gaps.
    if (level !== 3 && level !== 4) return html;
    if (closing) {
      if (open.pop() !== name) return html;
    } else {
      if (open.length || /\/\s*>$/.test(token[0])) return html;
      const attributes = [...token[0].matchAll(/\s+([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)];
      if (attributes.some(attribute => attribute[1].toLowerCase() === 'data-original-heading-level')) return html;
      firstLevel ??= level;
      open.push(name);
    }
    let value = token[0].replace(/^(<\/?h)[34]/i, `$1${level - 1}`);
    if (!closing) value = value.replace(/>$/, ` data-original-heading-level="${level}">`);
    changes.push({ start: token.index, end: tokens.lastIndex, value });
  }
  if (open.length || firstLevel !== 3) return html;
  for (let i = changes.length - 1; i >= 0; i--) {
    const { start, end, value } = changes[i];
    html = html.slice(0, start) + value + html.slice(end);
  }
  return html;
}
