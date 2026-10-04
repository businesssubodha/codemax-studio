import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('importer', Path(__file__).with_name('import-wordpress.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def item(path='/sample-article/', status='publish', content='<p>Original useful article content.</p>', password=''):
    return f'''<item><title>Original title</title><link>https://codemax.com.au{path}</link>
    <wp:post_type>post</wp:post_type><wp:status>{status}</wp:status><wp:post_password>{password}</wp:post_password>
    <wp:post_date>2026-01-03 08:00:00</wp:post_date><wp:post_date_gmt>2026-01-02 21:00:00</wp:post_date_gmt>
    <wp:post_modified_gmt>2026-01-03 21:00:00</wp:post_modified_gmt><dc:creator>subodha</dc:creator>
    <content:encoded><![CDATA[{content}]]></content:encoded>
    <wp:postmeta><wp:meta_key>private_token</wp:meta_key><wp:meta_value>DO_NOT_EXPORT</wp:meta_value></wp:postmeta>
    <wp:comment><wp:comment_author_email>private@example.com</wp:comment_author_email></wp:comment>
    </item>'''

def export(items):
    return ('''<rss xmlns:wp="http://wordpress.org/export/1.2/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><wp:wxr_version>1.2</wp:wxr_version>
    <wp:author><wp:author_login>subodha</wp:author_login><wp:author_display_name>Subodha De</wp:author_display_name><wp:author_email>private@example.com</wp:author_email></wp:author>'''+items+'</channel></rss>').encode()

class ImportTests(unittest.TestCase):
    def test_public_manifest_dates_do_not_advertise_prepublication_edits(self):
        self.assertIsNone(module.public_modified_date('2025-12-14T00:00:00Z', '2025-10-21T00:00:00Z'))
        self.assertIsNone(module.public_modified_date('2025-12-14T00:00:00Z', None))
        self.assertEqual(module.public_modified_date('2025-12-14T00:00:00Z', '2025-12-15T01:00:00Z'), '2025-12-15T01:00:00Z')

    def test_original_url_dates_and_author(self):
        posts, report = module.convert(export(item('/2026/01/original-slug/')))
        self.assertEqual(posts[0]['path'], '/2026/01/original-slug/')
        self.assertEqual(posts[0]['published'], '2026-01-02T21:00:00Z')
        self.assertEqual(posts[0]['displayDate'], '2026-01-03')
        self.assertEqual(posts[0]['author'], 'Subodha De')
        self.assertIn('Original useful article content.', posts[0]['html'])
        self.assertFalse(report['launchReady'])

    def test_private_posts_and_metadata_stay_private(self):
        posts, report = module.convert(export(item()+item('/draft/', 'draft')+item('/private/', 'private')+item('/protected/', password='secret')))
        self.assertEqual(len(posts), 1)
        output = str((posts, report))
        self.assertNotIn('DO_NOT_EXPORT', output)
        self.assertNotIn('private@example.com', output)
        self.assertNotIn('/protected/', output)

    def test_sanitisation_and_media_inventory(self):
        content = '<p onclick="alert(1)">Keep this</p><script>alert(1)</script><a href="javascript:alert(1)">Link</a><img src="/wp-content/uploads/photo.jpg" alt="Business owner" onerror="alert(1)"><iframe src="https://example.com"></iframe>'
        posts, report = module.convert(export(item(content=content)))
        body=posts[0]['html']
        for token in ['onclick','onerror','javascript:','<script','<iframe','alert(1)']:
            self.assertNotIn(token, body)
        self.assertIn('Keep this',body)
        self.assertEqual(report['mediaUrls'], ['https://codemax.com.au/wp-content/uploads/photo.jpg'])
        self.assertTrue(report['review'])

    def test_duplicate_and_unsafe_paths_stop_import(self):
        with self.assertRaises(ValueError):
            module.convert(export(item()+item()))
        for path in ['/blog/', '/services/test/', '/%2e%2e/escape/', '/?p=123', '/post.html', '/no-slash']:
            with self.subTest(path=path), self.assertRaises(ValueError):
                module.convert(export(item(path)))

    def test_shortcodes_and_empty_exports_stop_import(self):
        with self.assertRaises(ValueError):
            module.convert(export(item(content='[gallery ids="1,2"]')))
        with self.assertRaises(ValueError):
            module.convert(export(item(status='draft')))
        with self.assertRaises(ValueError):
            module.convert(export(item(content='<script>only code</script>')))

    def test_bracketed_prose_is_not_a_shortcode(self):
        posts, _ = module.convert(export(item(content='<p>[Internet] [cited 2020 May 20] [Guide]</p>')))
        self.assertIn('[Internet]',posts[0]['html'])

    def test_encoded_heading_is_readable_and_metadata_is_plain(self):
        posts, _ = module.convert(export(item(content='<p>&lt;h1&gt;A real heading&lt;/h1&gt; Useful article.</p>')))
        self.assertIn('<h2>A real heading</h2>',posts[0]['html'])
        self.assertNotIn('<',posts[0]['description'])

    def test_classic_editor_paragraphs(self):
        posts, _ = module.convert(export(item(content='First paragraph.\n\nSecond paragraph.')))
        self.assertEqual(posts[0]['html'], '<p>First paragraph.</p><p>Second paragraph.</p>')

    def test_confirmed_legacy_links_use_live_destinations(self):
        content = '<p><a href="https://www.codemax.com.au/contact/">Contact</a> <a href="/website_9b0af0dc/blog/">Blog</a> <a href="/services/">Services</a></p>'
        posts, _ = module.convert(export(item(content=content)))
        body = posts[0]['html']
        self.assertIn('href="https://codemax.com.au/#enquiry"', body)
        self.assertIn('href="https://codemax.com.au/blog/"', body)
        self.assertIn('href="https://codemax.com.au/#services"', body)
        self.assertNotIn('website_9b0af0dc', body)

    def test_draft_video_marker_is_removed(self):
        content = '<p>Useful prose.</p><p>[YOUTUBE: https://www.youtube.com/watch?v=ABCDEFGHI]</p>'
        posts, _ = module.convert(export(item(content=content)))
        self.assertNotIn('ABCDEFGHI', posts[0]['html'])
        self.assertIn('Useful prose.', posts[0]['html'])

    def test_exact_article_aliases_use_original_published_paths(self):
        for old, new in [
            ('/blog/exploring-the-latest-innovations-in-ai-technologies/', '/exploring-latest-innovations-in-ai-technologies/'),
            ('/blog/wordpress-management-services-by-codemax/', '/wordpress-management-services-by-codemax/'),
            ('/blog/melbourne-wordpress-management-services/', '/melbourne-wordpress-management-services/'),
        ]:
            for path in [old, old.rstrip('/')]:
                self.assertEqual(module.safe_url('https://codemax.com.au' + path), 'https://codemax.com.au' + new)
        self.assertEqual(module.safe_url('/blog/unknown-article/'), '/blog/unknown-article/')

    def test_markup_cannot_become_a_crawlable_url(self):
        for value in ['&lt;div style=', '<div style=', '/bad&gt;path', 'https://example.com/"bad']:
            self.assertIsNone(module.safe_url(value))
        content = '<p>Keep this text.</p><a href="&lt;div style=">Invalid link</a><a href="https://www.youtube.com/watch?v=FRc98KdkTG8">Watch the video</a>'
        posts, report = module.convert(export(item(content=content)))
        self.assertNotIn('href="&lt;', posts[0]['html'])
        self.assertIn('Invalid link', posts[0]['html'])
        self.assertIn('https://www.youtube.com/watch?v=FRc98KdkTG8', posts[0]['html'])
        self.assertIn('Removed unsafe URL', str(report['review']))

if __name__ == '__main__':
    unittest.main()
