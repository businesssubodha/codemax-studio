import audit from '../data/article-list-break-repairs.json' with { type: 'json' };

const articles = new Set(audit.articles.map(article => article.path));
const rawTextElements = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/** Remove only bare, direct-list BRs at the exact audited item boundaries. */
export function repairArticleListBreaks(path, html) {
  if (!articles.has(path)) return html;
  const pattern = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|<\?[^>]*\?>|<\/?([a-z][a-z0-9:-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  const tokens = [];
  for (let match; (match = pattern.exec(html));) {
    if (!match[1]) continue;
    const name = match[1].toLowerCase();
    const closing = match[0].startsWith('</');
    if (!closing && name === 'plaintext') break;
    if (!closing && rawTextElements.has(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'gi');
      end.lastIndex = pattern.lastIndex;
      if (!end.exec(html)) break;
      // Keep a barrier token, so a sample or media block cannot disappear from
      // the adjacency check even if its contents resemble list markup.
      tokens.push({ name, closing: false, raw: true, start: match.index, end: end.lastIndex });
      pattern.lastIndex = end.lastIndex;
      continue;
    }
    tokens.push({ name, closing, start: match.index, end: pattern.lastIndex, value: match[0] });
  }
  const stack = [], changes = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.raw) continue;
    if (token.closing) {
      const index = stack.lastIndexOf(token.name);
      if (index !== -1) stack.length = index;
      continue;
    }
    if (token.name === 'br' && /^<br\s*\/?\s*>$/i.test(token.value)) {
      const owner = stack.at(-1), before = tokens[i - 1], after = tokens[i + 1];
      const afterListOpen = before?.name === owner && !before.closing;
      const afterItemClose = before?.name === 'li' && before.closing;
      const beforeItemOpen = after?.name === 'li' && !after.closing;
      const beforeListClose = after?.name === owner && after.closing;
      if (['ul', 'ol'].includes(owner) && (afterListOpen || afterItemClose) && (beforeItemOpen || beforeListClose)
          && /^\s*$/.test(html.slice(before.end, token.start)) && /^\s*$/.test(html.slice(token.end, after.start))) {
        changes.push(token);
      }
    }
    if (!voidElements.has(token.name) && !/\/\s*>$/.test(token.value)) stack.push(token.name);
  }
  for (let i = changes.length - 1; i >= 0; i--) {
    const { start, end } = changes[i];
    html = html.slice(0, start) + html.slice(end);
  }
  return html;
}
