# Production launch: new studio + existing WordPress blog

Status: prepared in GitHub; not activated. Domain/account changes require access to the Cloudflare dashboard. The browser used during preparation was held at Cloudflare security verification.

## Confirmed before launch

On 28 September 2026, public DNS returned:
- Nameservers: ns1.bluehost.com and ns2.bluehost.com.
- Apex A record: 50.6.53.133.

These are observations, not a complete DNS backup. Read the actual Bluehost DNS zone before changing nameservers. Preserve MX, SPF, DKIM, DMARC, Resend CNAMEs, verification TXT records and other subdomains. GoDaddy is the registrar; Bluehost currently supplies authoritative DNS.

The user wants existing blog posts to stay in WordPress, with original indexed URLs. Do not move the apex A/CNAME to Pages or Vercel. Do not delete the WordPress hosting. The new router uses a Cloudflare **Worker Route**, not a Worker Custom Domain.

## 1. Create the static site in Cloudflare Pages

Create a separate Pages project, suggested name `codemax-web`, using the existing `businesssubodha/codemax-studio` GitHub repository:

| Setting | Value |
| --- | --- |
| Production branch | main |
| Framework | Astro |
| Root directory | repository root (blank), NOT cloudflare/contact |
| Build command | npm run build |
| Build output directory | dist |
| PUBLIC_CONTACT_ENDPOINT | https://codemax-studio.citizenshipexam-com-au.workers.dev/contact |
| PUBLIC_TURNSTILE_SITE_KEY | 0x4AAAAAAFDTlKejyK9i_pqY |

These two PUBLIC values are public configuration, not private keys. The Resend and Turnstile secrets stay in the existing contact Worker. Do not create a new contact Worker or overwrite its secrets.

Record the actual Pages URL; the suggested project name may be unavailable. Add that exact hostname to the existing Turnstile widget's hostname list and its https origin to the contact Worker's ALLOWED_ORIGINS (append, preserving existing origins). This allows testing the form on Pages before launch. Save the same allowed-origin list in cloudflare/contact/wrangler.toml to avoid future drift.

The supplied public/_headers carries security/cache headers and noindex only for pages.dev hosts. It does not block the real domain from indexing. Do not add an apex custom domain to Pages for this hybrid launch.

## 2. Onboard DNS without moving the origin

Add codemax.com.au to Cloudflare on the Free plan (or open its existing zone if already added). Compare every imported record with the full Bluehost zone. Keep the apex pointing to the original WordPress origin and keep www directed to the same working site. Record current values and rollback instructions.

Only once mail and website DNS records have been checked, use GoDaddy to change nameservers to the exact two nameservers Cloudflare assigns. Never invent these values. Check DNSSEC at the registrar before changing providers and follow Cloudflare's migration instructions if it is enabled.

Once the zone is active, proxy the apex and www website records through Cloudflare. Use Full (strict) TLS only after confirming the origin certificate is valid for both hosts; do not use Flexible. Verify the unchanged WordPress homepage, posts, admin, media, email DNS and sending-domain records before activating the router.

## 3. Deploy the separate production router

The router is in cloudflare/production, distinct from cloudflare/contact.

- Build command: none.
- Deploy command from that directory: `npx wrangler deploy`.
- Set `PAGES_ORIGIN` in wrangler.toml to the verified Pages URL (HTTPS origin only, no path/query).
- Keep `ENABLED = "false"` and no routes during setup.
- Run `node --test cloudflare/production/worker.test.mjs` from the repository root.
- When ready, set `ENABLED = "true"` and attach Worker Routes `codemax.com.au/*` and `www.codemax.com.au/*` to the `codemax.com.au` zone. Ensure DNS records remain pointed at Bluehost.

The router serves the new homepage, the six named service pages, known brand/font/portfolio assets and Astro JS/CSS. `/studio-sitemap.xml` serves the new site's sitemap. It forwards every other request to the existing WordPress origin, including `/blog/`, original article URLs, categories, feeds, media, admin, WordPress queries, POST requests and logged-in WordPress visitors. Original robots and sitemap endpoints stay untouched.

The router only removes preview noindex from successful static responses that it intentionally serves on the production hosts. WordPress response headers are untouched. Pages failures fall back to the original origin. Visitor cookies and Authorization headers are not sent to Pages.

## 4. Verify before calling production complete

- Apex homepage and all six services show the new design and return 200 with the correct production canonical and no noindex directive.
- www new pages redirect to the apex without losing query parameters.
- Blog archive and a representative selection of original articles still return their original content at their original URLs.
- WordPress admin, images, feeds and existing sitemaps work. Test authenticated WordPress editing separately.
- Submit a deliberate test enquiry, confirm inbox receipt and verify the existing Turnstile widget accepts the production hostnames.
- Recheck PageSpeed on the REAL domain: prior Vercel scores do not verify this new routing setup.
- Submit https://codemax.com.au/studio-sitemap.xml in Search Console alongside the existing WordPress sitemap. Optionally append its Sitemap line in the WordPress SEO plugin's robots settings without replacing existing rules.
- Review Free-plan usage limits and route failure behavior; no paid subscription is required by this prepared setup. The existing WordPress hosting and domain renewal costs continue.

Rollback: disable/remove the new Worker Routes or set ENABLED=false. With the original DNS origin retained, requests return to WordPress. Do not change email records for a website rollback.

## Documentation

- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/workers/configuration/routing/routes/
