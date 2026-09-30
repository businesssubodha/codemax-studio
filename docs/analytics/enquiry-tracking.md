# CodeMax enquiry measurement

Status: the implementation is installed but inactive until CodeMax's actual GA4 web-stream measurement ID is supplied. No ID was invented, no analytics account was created, and end-to-end receipt in Google Analytics has not been verified.

## Activate

1. In the CodeMax Google Analytics property, open Admin → Data streams → the codemax.com.au web stream. Copy the G- measurement ID. This identifier is public; do not supply a password or API secret.
2. Set `measurementId` in `src/data/analytics.json` (or PUBLIC_GA_MEASUREMENT_ID in the build environment) and deploy.
3. In the GA4 stream, disable automatic enhanced measurement of form interactions and browser-history pageviews. Review other enhanced-measurement settings so auto-collected events do not duplicate these explicit events or collect unnecessary URL details. Disable user-provided data collection for this setup.
4. Accept optional analytics on the real domain and verify page_view in GA4 Realtime. No tag loads before consent; declining prevents loading. Preference controls let a visitor stop future events. Preview domains are excluded.
5. Verify contact_phone_click and contact_email_click. These measure attempts to open an app, not completed calls or sent email.
6. With the owner's permission, perform a clearly labelled test enquiry and verify generate_lead only after the Worker returns HTTP success and `{ok:true}`. Invalid forms and submission failures must not fire it. This reflects accepted submission, not confirmed inbox delivery or a qualified sales lead. Mark generate_lead as a key event in GA4.

Only fixed event names and a query/hash-free page location are sent by the custom handlers. Name, email, company, enquiry text, phone numbers, mailto URLs and form field values are not event parameters. Advertising consent is denied. Consent choices are stored locally; consent withdrawal stops future custom events but does not erase already processed data. Optional analytics will undercount visitors who decline or block it.

## Implementation

Shared Analytics component: homepage, service pages and journal. Contact submission dispatch is placed after the server success check. Events are implemented in `src/lib/analytics.js`. Tests cover consent, preview exclusions, fixed event payloads and withdrawing/regranting consent. No test enquiry was sent during development.

## Remaining business evidence

The homepage now has three quote-based service options and a verified self-project explanation of CodeMax's rebuild. Fixed prices, turnaround promises, client results and testimonials still require owner-approved evidence. The existing portfolio images have not been reclassified as confirmed paid client projects.

Sources: https://developers.google.com/analytics/devguides/collection/ga4/events ; https://developers.google.com/analytics/devguides/collection/ga4/views ; https://support.google.com/analytics/answer/9539598
