# WordPress blog migration

## Current state

The new `/blog/` layout and original-path article template are ready. No original articles have been imported yet: direct WordPress/API/feed requests return HTTP 406. The empty collection displays six curated links to the original website and remains noindex. It is excluded from the sitemap until articles are imported. Keep the original WordPress site live.

## Obtain the source

In the original WordPress dashboard, select **Tools → Export → All content → Download Export File**. Upload that XML for migration, or save it locally under `imports/codemax.xml`. This folder is ignored by git. Do not commit raw exports: they can include private content, comments and author email addresses. The WXR export references media but does not contain the image files themselves.

## Import and review

Requires Python 3 and the existing Node dependencies:

```sh
npm run import:wordpress -- imports/codemax.xml
npm run test:import
npm run build
```

The importer replaces `src/data/blog-posts.json` with public, published, non-password-protected posts. Use a complete export, not a partial batch. It preserves original permalink paths, publication dates and public author names; it copies explicit SEO titles/descriptions where available and inventories public pages separately. It never imports private metadata, comments or author email addresses.

Review `docs/blog-migration-inventory.json`, every article and all warnings before publishing. Shortcodes, conflicting routes and unsuitable permalink formats stop the import for explicit review. Active embeds are removed and reported; restore appropriate embeds deliberately. The importer is not a full WordPress renderer: classic-editor formatting, headings, tables, lazy-loaded images, captions and plugin content need comparison with the originals. Review fallback descriptions and image alt text.

## Before moving the production domain

- Compare the export URL inventory against the original sitemaps and Search Console indexed pages. Include pages, categories, tags, pagination, feeds and other indexed routes; importing posts alone does not cover them.
- Copy required media into durable hosting. Preserve `/wp-content/uploads/` paths where possible, including images currently used by the homepage. Check internal links and downloadable files.
- Keep each indexed article at its original URL. Use individual permanent redirects only for deliberate URL changes with a relevant replacement. Never redirect all old articles to the homepage.
- Check article content, author/date, unique title/description, canonical, BlogPosting markup, sitemap membership and HTTP 200 responses. Confirm removed content produces the intended 404/410 or relevant redirect.
- Test the contact form and mobile layout on the deployment. Vercel preview hosts intentionally return `X-Robots-Tag: noindex, follow`; the production domain must be indexable after cutover.
- Point DNS to Vercel only after URL and media coverage are complete. Submit the production sitemap in Search Console and monitor indexing, redirects and traffic. Keep a backup and the old hosting available for rollback.

The importer does not switch DNS, download media, create redirects or declare the migration ready to launch.
