import audit from '../data/legacy-link-repairs.json' with { type: 'json' };

const origin = 'https://codemax.com.au';
const hosts = new Set(['codemax.com.au', 'www.codemax.com.au']);
const repairs = new Map(audit.repairs.map(repair => [repair.path, repair]));
const rawTextElements = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);

function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function repairAnchor(opening, content, closing) {
  // Parse complete attributes so data-href and href-like text in another
  // attribute cannot masquerade as the actual navigation destination.
  const attributes = [...opening.matchAll(/(\s+)([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)];
  const hrefs = attributes.filter(attribute => attribute[2].toLowerCase() === 'href');
  if (hrefs.length !== 1 || !hrefs[0][3]) return opening + content + closing;
  const href = hrefs[0];
  const value = href[4] ?? href[5] ?? href[6];

  // Query URLs, including WordPress editing/preview URLs, are outside this
  // audit. Leave entity-encoded, fragment-bearing or ambiguous addresses
  // untouched too: their query/fragment semantics were not verified.
  if (/[?&#\\\s]/.test(value) || /[\u0000-\u001f\u007f]/.test(value)) return opening + content + closing;
  if (!value.startsWith('/') && !/^https?:\/\//i.test(value)) return opening + content + closing;
  let url;
  try { url = new URL(value, origin); } catch { return opening + content + closing; }
  if (!['http:', 'https:'].includes(url.protocol) || !hosts.has(url.hostname) || url.username || url.password || url.port) return opening + content + closing;
  const repair = repairs.get(url.pathname);
  if (!repair) return opening + content + closing;
  if (repair.action === 'unlink') return content;

  const quoted = href[3][0] === '"' || href[3][0] === "'";
  const valueStart = href.index + href[0].length - href[3].length + (quoted ? 1 : 0);
  const updatedOpening = opening.slice(0, valueStart) + origin + repair.destination + opening.slice(valueStart + value.length);
  return updatedOpening + (repair.text ? escapeText(repair.text) : content) + closing;
}

/**
 * Pure, idempotent repair of audited public CodeMax article hyperlinks.
 * Preserves unrecognised HTML byte-for-byte. Only exact audited path keys
 * are considered; slash variants are separately recorded in the JSON map.
 * Relative-to-page links, queries, fragments and encoded addresses are
 * deliberately untouched. No redirect, network or filesystem operations.
 */
export function repairLegacyLinks(html) {
  // Token offsets let us retain formatting and all unrelated HTML, unlike
  // parsing and serialising an entire document. Quoted > characters are safe.
  const tokens = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|<\?[^>]*\?>|<\/?([a-z][a-z0-9:-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  const changes = [];
  let active = null;
  for (let token; (token = tokens.exec(html));) {
    if (!token[1]) continue; // Comments/declarations are never navigation.
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
    if (name !== 'a') continue;
    if (!closing) {
      if (active) { active.depth++; active.invalid = true; }
      // A slash at the end of an unquoted URL belongs to that URL; only a
      // separate/quoted closing slash is treated as an ambiguous self-close.
      else if (!/(?:\s|["'])\/\s*>$/.test(token[0])) active = { start: token.index, contentStart: tokens.lastIndex, opening: token[0], depth: 1, invalid: false };
    } else if (active && /^<\/a\s*>$/i.test(token[0])) {
      active.depth--;
      if (active.depth) continue;
      if (!active.invalid) {
        const original = html.slice(active.start, tokens.lastIndex);
        const repaired = repairAnchor(active.opening, html.slice(active.contentStart, token.index), token[0]);
        if (original !== repaired) changes.push({ start: active.start, end: tokens.lastIndex, value: repaired });
      }
      active = null;
    }
  }
  // Apply from the end so original offsets remain valid for earlier anchors.
  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i];
    html = html.slice(0, change.start) + change.value + html.slice(change.end);
  }
  return html;
}
