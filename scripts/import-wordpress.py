#!/usr/bin/env python3
"""Import published WXR posts; never publish private data or guess changed URLs."""
import argparse
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://codemax.com.au'
LEGACY_CONTENT_LINKS = {
    '/contact/': '/#enquiry',
    '/services/': '/#services',
    '/website_9b0af0dc/': '/',
    '/website_9b0af0dc/blog/': '/blog/',
    '/website_9b0af0dc/services/': '/#services',
    '/about/': '/#about',
    '/about-us/': '/#about',
    '/web-design/': '/services/web-design-melbourne/',
    '/blog/exploring-the-latest-innovations-in-ai-technologies/': '/exploring-latest-innovations-in-ai-technologies/',
    '/blog/wordpress-management-services-by-codemax/': '/wordpress-management-services-by-codemax/',
    '/blog/melbourne-wordpress-management-services/': '/melbourne-wordpress-management-services/',
    '/modern-website-redesign-boost-business-drive-growth/': '/website-redesign-drives-growth/',
}
NS = {'wp': 'http://wordpress.org/export/1.2/', 'content': 'http://purl.org/rss/1.0/modules/content/', 'dc': 'http://purl.org/dc/elements/1.1/'}
RESERVED = {'blog', 'services', '404', 'robots.txt', 'sitemap.xml', 'wp-content', '_astro', 'assets', 'favicon.svg'}
ALLOWED = set('p br hr h2 h3 h4 h5 h6 ul ol li a strong em b i blockquote pre code img figure figcaption table thead tbody tfoot tr th td div span section details summary sub sup del'.split())
VOID = {'br', 'hr', 'img'}
DROP = {'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'template', 'noscript'}

def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', html.unescape(value)))).strip()

def safe_url(value, image=False):
    value = html.unescape(value).strip()
    if any(ord(c) < 32 for c in value) or any(c in value for c in '<>"'):
        return None
    u = urlsplit(value)
    if not image and u.hostname in {'ztk.cjf.mybluehost.me', 'www.codemax.com.au'}:
        value = ORIGIN + u.path + ('?' + u.query if u.query else '') + ('#' + u.fragment if u.fragment else '')
        u = urlsplit(value)
    if not image and (u.hostname == 'codemax.com.au' or (not u.hostname and u.path.startswith('/'))):
        path = u.path.rstrip('/') + '/' if u.path else '/'
        if path in LEGACY_CONTENT_LINKS and not u.query:
            destination = LEGACY_CONTENT_LINKS[path]
            # Preserve meaningful source anchors unless the replacement already
            # points to a specific section of the new landing page.
            value = ORIGIN + destination + (('#' + u.fragment) if u.fragment and '#' not in destination else '')
            u = urlsplit(value)
    if u.scheme and u.scheme.lower() not in ({'http', 'https'} if image else {'http', 'https', 'mailto', 'tel'}):
        return None
    if image:
        return urljoin(ORIGIN, value)
    return value

class CleanHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.output, self.media, self.warnings, self.stack = [], set(), set(), []
        self.dropped = 0

    def handle_starttag(self, tag, attrs):
        if self.dropped:
            if tag not in VOID and tag not in {'input', 'embed'}:
                self.dropped += 1
            return
        if tag == 'iframe':
            attrs_dict = dict(attrs)
            src = safe_url(attrs_dict.get('src', ''))
            if src and urlsplit(src).hostname in {'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'}:
                video = urlsplit(src).path.rsplit('/', 1)[-1]
                if re.fullmatch(r'[A-Za-z0-9_-]{11}', video):
                    label = plain(attrs_dict.get('title') or 'Watch the accompanying video on YouTube')
                    self.output.append('<p><a href="https://www.youtube.com/watch?v=' + video + '">' + html.escape(label) + '</a></p>')
        if tag in DROP:
            self.warnings.add('Removed active/embedded element: ' + tag)
            if tag not in {'input', 'embed'}:
                self.dropped = 1
            return
        if tag == 'h1':
            tag = 'h2'
        if tag not in ALLOWED:
            return
        clean = []
        for key, value in attrs:
            if value is None:
                continue
            if tag == 'a' and key == 'rel':
                clean.append(('rel', ' '.join(v for v in value.split() if v in {'nofollow', 'sponsored', 'ugc', 'noopener', 'noreferrer'})))
            elif key in {'id', 'title', 'alt'}:
                clean.append((key, value))
            elif key in {'width', 'height', 'colspan', 'rowspan', 'start'} and value.isdigit():
                clean.append((key, value))
            elif (tag == 'a' and key == 'href') or (tag == 'img' and key == 'src'):
                url = safe_url(value, tag == 'img')
                if url:
                    clean.append((key, url))
                    if tag == 'img' or '/wp-content/uploads/' in url:
                        self.media.add(urljoin(ORIGIN, url))
                else:
                    self.warnings.add('Removed unsafe URL')
        if tag == 'img':
            if not any(k == 'src' for k, v in clean):
                self.warnings.add('Image missing a usable src; review lazy-loaded image')
                return
            if not any(k == 'alt' for k, v in clean):
                clean.append(('alt', ''))
                self.warnings.add('Image requires alt-text review')
            clean += [('loading', 'lazy'), ('decoding', 'async')]
        self.output.append('<' + tag + ''.join(' ' + k + '="' + html.escape(v, quote=True) + '"' for k, v in clean) + '>')
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == 'h1':
            tag = 'h2'
        if self.dropped:
            self.dropped -= 1
            return
        if tag in self.stack:
            while self.stack:
                last = self.stack.pop()
                self.output.append('</' + last + '>')
                if last == tag:
                    break

    def handle_data(self, value):
        if not self.dropped:
            self.output.append(html.escape(value))

    def result(self):
        while self.stack:
            self.output.append('</' + self.stack.pop() + '>')
        return ''.join(self.output).strip()

def original_path(link):
    u = urlsplit(link)
    if u.scheme not in {'http', 'https'} or u.hostname not in {'codemax.com.au', 'www.codemax.com.au'} or u.query or u.fragment:
        raise ValueError('Requires a real CodeMax permalink without query or fragment: ' + link)
    decoded = unquote(u.path)
    parts = decoded.strip('/').split('/')
    if not decoded.startswith('/') or not all(parts) or any(x in {'.', '..'} for x in parts) or any(c in decoded for c in '\\?#') or any(ord(c) < 32 for c in decoded):
        raise ValueError('Unsafe or empty permalink: ' + link)
    if parts[0] in RESERVED or '.' in parts[-1] or not u.path.endswith('/'):
        raise ValueError('Permalink needs explicit routing review: ' + link)
    return '/' + '/'.join(parts) + '/'

def date_value(item, field):
    value = item.findtext('wp:' + field, '', NS)
    if value and not value.startswith('0000'):
        return datetime.strptime(value, '%Y-%m-%d %H:%M:%S').isoformat() + 'Z'
    if field == 'post_date_gmt':
        try:
            return parsedate_to_datetime(item.findtext('pubDate', '')).isoformat()
        except (ValueError, TypeError):
            return None
    return None

def public_modified_date(published, modified):
    if not published or not modified:
        return None
    try:
        if datetime.fromisoformat(modified.replace('Z', '+00:00')) < datetime.fromisoformat(published.replace('Z', '+00:00')):
            return None
    except (ValueError, TypeError):
        return None
    return modified

def convert(data):
    if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper():
        raise ValueError('DTD/entity declarations are not supported')
    root = ET.fromstring(data)
    channel = root.find('channel')
    if channel is None or channel.find('wp:wxr_version', NS) is None:
        raise ValueError('Expected a WordPress WXR 1.2 export')
    authors = {}
    for a in channel.findall('wp:author', NS):
        authors[a.findtext('wp:author_login', '', NS)] = plain(a.findtext('wp:author_display_name', '', NS))
    attachments = {}
    for item in channel.findall('item'):
        if item.findtext('wp:post_type', '', NS) == 'attachment':
            ameta = {m.findtext('wp:meta_key', '', NS): m.findtext('wp:meta_value', '', NS) for m in item.findall('wp:postmeta', NS)}
            attachments[item.findtext('wp:post_id', '', NS)] = {'url': safe_url(item.findtext('wp:attachment_url', '', NS), image=True), 'alt': plain(ameta.get('_wp_attachment_image_alt', ''))}
    posts, paths, inventory, media, review = [], set(), [], set(), []
    for item in channel.findall('item'):
        kind = item.findtext('wp:post_type', '', NS)
        status = item.findtext('wp:status', '', NS)
        if kind == 'attachment':
            # Do not expose unrelated/private media from an all-content export.
            continue
        if status != 'publish' or item.findtext('wp:post_password', '', NS):
            continue
        link = item.findtext('link', '')
        if kind != 'post':
            if kind == 'page':
                inventory.append({'url': link, 'type': 'page', 'state': 'needs page migration review'})
            continue
        path = original_path(link)
        if path in paths:
            raise ValueError('Duplicate permalink: ' + path)
        paths.add(path)
        title = plain(item.findtext('title', ''))
        source = item.findtext('content:encoded', '', NS)
        if '&lt;h1' in source:
            source = html.unescape(source)
        # This was a draft video marker, not a playable video or editorial copy.
        source = re.sub(r'<p(?:\s[^>]*)?>\s*\[YOUTUBE:\s*https?://(?:www\.)?youtube\.com/watch\?v=ABCDEFGHI\s*\]\s*</p>', '', source, flags=re.I)
        if not title or not plain(source):
            raise ValueError('Empty article: ' + path)
        # Plugin shortcodes must be rendered in WordPress before importing.
        if re.search(r'\[/?(?:gallery|caption|audio|video|playlist|embed|wp_caption|contact-form-7|elementor-template|metform|ultp|vc_[\w-]+)(?:\s[^\]]*)?/?\]', source):
            raise ValueError('Unrendered shortcode needs source review: ' + path)
        if not re.search(r'<(?:p|div|h[1-6]|ul|ol|table|blockquote)\b', source, re.I):
            source = ''.join('<p>' + part.replace('\n', '<br>') + '</p>' for part in re.split(r'\n\s*\n', source.strip()))
        source = re.sub(r'\[([^\]\n]+)\]\((https?://[^\s)]+)\)', lambda m: '<a href="' + html.escape(m[2], quote=True) + '">' + html.escape(m[1]) + '</a>', source)
        cleaner = CleanHTML()
        cleaner.feed(source)
        content = cleaner.result()
        if not plain(content):
            raise ValueError('Article has no readable content after sanitising: ' + path)
        published = date_value(item, 'post_date_gmt')
        if not published:
            raise ValueError('Missing original publication date: ' + path)
        meta = {m.findtext('wp:meta_key', '', NS): m.findtext('wp:meta_value', '', NS) for m in item.findall('wp:postmeta', NS)}
        description = plain(meta.get('_yoast_wpseo_metadesc') or meta.get('rank_math_description') or '')
        if not description or '%%' in description:
            description = plain(content)[:157].rsplit(' ', 1)[0] + '…'
        seo_title = plain(meta.get('_yoast_wpseo_title') or meta.get('rank_math_title') or '')
        if not seo_title or '%%' in seo_title or '%title%' in seo_title:
            seo_title = title + ' | CodeMax'
        featured = attachments.get(meta.get('_thumbnail_id'), None)
        if featured and featured['url']:
            media.add(featured['url'])
        author = authors.get(item.findtext('dc:creator', '', NS)) or 'CodeMax'
        categories = sorted({plain(c.text or '') for c in item.findall('category') if c.get('domain') == 'category' and c.text})
        local_date = item.findtext('wp:post_date', '', NS)[:10]
        display_date = local_date if re.fullmatch(r'\d{4}-\d{2}-\d{2}', local_date) and not local_date.startswith('0000') else published[:10]
        posts.append({'path': path, 'sourceUrl': link, 'title': title, 'seoTitle': seo_title, 'description': description, 'author': author, 'published': published, 'displayDate': display_date, 'modified': date_value(item, 'post_modified_gmt'), 'categories': categories, 'featuredImage': featured, 'html': content})
        media.update(cleaner.media)
        inventory.append({'url': link, 'destination': ORIGIN + path, 'type': 'post', 'state': 'same path; review content and media'})
        for warning in sorted(cleaner.warnings):
            review.append({'path': path, 'warning': warning})
    if not posts:
        raise ValueError('No public published posts found; existing data was not changed')
    posts.sort(key=lambda p: p['published'], reverse=True)
    return posts, {'posts': len(posts), 'urls': inventory, 'mediaUrls': sorted(media), 'review': review, 'launchReady': False, 'note': 'Full URL/archive coverage and media migration still require review. No DNS change is authorised by this import.'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('export', type=Path)
    parser.add_argument('--output', type=Path, default=ROOT / 'src/data/blog-posts.json')
    parser.add_argument('--report', type=Path, default=ROOT / 'docs/blog-migration-inventory.json')
    args = parser.parse_args()
    # Parse/validate everything before touching destination files.
    posts, report = convert(args.export.read_bytes())
    overrides_path = ROOT / 'src/data/blog-seo-overrides.json'
    overrides = json.loads(overrides_path.read_text()) if overrides_path.exists() else {}
    for post in posts:
        for key, value in overrides.get(post['path'], {}).items():
            if key in {'seoTitle', 'description'}:
                post[key] = value
    for path, value in [(args.output, posts), (args.report, report)]:
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + '.tmp')
        temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        temporary.replace(path)
    manifest = [{'path': p['path'], 'modified': public_modified_date(p['published'], p['modified'])} for p in posts]
    (args.output.parent / 'blog-routes.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(posts)} published articles. Review {len(report["mediaUrls"])} media URLs and {len(report["review"])} content warnings before launch.')

if __name__ == '__main__':
    try:
        main()
    except (ValueError, ET.ParseError, OSError) as error:
        print('Import stopped: ' + str(error), file=sys.stderr)
        sys.exit(1)
