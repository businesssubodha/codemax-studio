# CodeMax contact activation

Website stays on Vercel. This Worker handles contact submissions using Turnstile and Resend. The recipient is a server secret, never a public build variable. Until both public settings are supplied, the existing email-draft form remains active.

1. In Resend, verify a sending domain you own. Preserve existing mailbox MX records; use a sending subdomain if needed. Create a sending API key.
2. In Cloudflare Turnstile, create a Managed widget for `codemax-studio.vercel.app`, `codemax.com.au` and `www.codemax.com.au`. Do not use test keys in production.
3. Deploy `cloudflare/contact` as a Worker with Wrangler (`npx wrangler deploy` from this directory), or import the repository using Workers Builds with this root directory.
4. In the Worker's Settings > Variables and Secrets, add these as encrypted secrets:
   - `TURNSTILE_SECRET_KEY`: the widget secret
   - `RESEND_API_KEY`: the sending API key
   - `CONTACT_TO`: your private destination inbox
   - `CONTACT_FROM`: a sender on your verified domain, such as `CodeMax <enquiries@send.codemax.com.au>` only if that domain is verified
5. In Vercel project environment variables, set `PUBLIC_CONTACT_ENDPOINT` to `https://<actual-worker-host>/contact` and `PUBLIC_TURNSTILE_SITE_KEY` to the widget site key. Redeploy the website.
6. Submit a real test enquiry from the website; verify inbox arrival and Reply-To, then check expired security checks and failed submission messages. Provider acceptance is not proof of inbox delivery. No live email test has been run as part of code preparation.

Secrets must not be committed or placed in `PUBLIC_` variables. The code does not log or store enquiry bodies. Resend processes the enquiry for delivery. Turnstile tokens are verified server-side, with hostname and action checks. The Worker accepts only listed origins and bounded JSON inputs. Each submission requires a fresh Turnstile token. If changing domains, update the Worker origin list and widget hostnames before enabling the form there.

Local verification: `node --test cloudflare/contact/worker.test.mjs` and `npm run build` from the repository root. Tests mock external services and do not send emails.
