# Portfolio security review — 19 November 2026

Reviewed against the supplied **SECURE — 7 security checks before launch** PDF.
Scope: this portfolio, its static production export, browser-local Python games,
contact draft composer, npm dependencies, working files, and available Git history.
Project case studies mention JWT/REST/databases; those are descriptions of other
projects, not services implemented by this portfolio.

| PDF check | Finding and action |
| --- | --- |
| 1. Rate limiting | No API routes, authentication, billing, AI calls, email service, or server writes. No server rate limiter needed in this application. The arcade worker queue is bounded to eight requests to avoid unbounded local work. Public asset flood/DDoS protection belongs at the host/CDN. |
| 2. Input validation | Contact subject is allowlisted; message is 10–2,000 characters, control characters rejected, mailto fields encoded. Terminal/search lengths and terminal history are bounded. Wallpaper values loaded from storage are allowlisted. Python game requests reject unknown fields, actions, invalid types (including boolean indexes), ranges, and oversized serialized requests. These are browser-local controls, not a claim of server validation; there is no server endpoint. React escapes displayed user text; no user-supplied Python or shell code is executed. |
| 3. Secrets | No high-confidence key-pattern matches in 111 available history blobs and 76 working files at scan time. No key rotation identified. Scanner prints locations/rules only, never values. `.env*` already ignored; ZIP packaging now also excludes environment files, credential directories, private-key/certificate files, and local databases. Gitleaks was not installed; the included pattern scanner is narrower than Gitleaks and is not an exhaustive entropy or secret-detection audit. |
| 4. Packages | `npm audit --json`: zero vulnerabilities, including zero high/critical. All 12 declared runtime/development packages resolve by their exact names on the official npm registry; maintainer metadata inspected. No package changes or forced upgrades were necessary. The existing lockfile remains tracked. Earlier 3D modules still import Three/R3F/Drei/GSAP, so they were retained with their source files. Pyodide is a separately vendored 0.27.7 distribution, outside npm audit coverage; no claim of a complete WASM/Python supply-chain audit. |
| 5. Errors | Worker sends fixed friendly messages rather than raw exception strings. Custom application error and missing-page views avoid showing exceptions. Production browser source maps and powered-by header disabled. Preview server does not log request data. Static site has no application server logs or server debug mode. Never expose `next dev` to the internet. |
| 6. Uploads | No visitor file picker, upload form, storage bucket, or upload endpoint. Supplied résumé/video/logo are bundled public assets, not an upload facility. No extra upload infrastructure introduced. |
| 7. Access control | No accounts, database, Supabase, private records, or cross-user endpoints. All exported assets are public by design. Browser game state/preferences stay on that browser and are not credentials. Portfolio lock screen is an entrance animation, not authentication. Never put confidential data in `public/`. |

## Production policy

`npm run build` now runs `scripts/secure-export.mjs` after Next's static export.
It hashes the exact inline hydration scripts and inserts a Content Security Policy
into each exported HTML page. JavaScript `unsafe-inline` and `unsafe-eval` are not
permitted. WebAssembly compilation remains allowed for the local Python worker.
Requests/assets are same-origin; objects, base tags, form submissions, and inline
event handlers are blocked. Inline CSS remains necessary for React window positions
and animations and is explicitly permitted. These choices were tested with the
live wallpaper, entrance, app launch, and a real Python game move.

Generated `out/_headers` supports hosts that honor that format. Equivalent values
are in `out/security-headers.json`: CSP including frame-ancestors, nosniff, DENY
framing, referrer policy, disabled camera/microphone/location/payment/USB, and HSTS.
**The deployment host must actually send these HTTP headers over HTTPS.** Next
`headers()` does not run in a static export. GitHub Pages does not apply `_headers`;
its HTML meta CSP still works, but frame-ancestor, HSTS, and other header-only
controls require a host/proxy supporting response headers. The hosting setup has
not been changed or deployed as part of this review. HTTPS/HSTS and CDN abuse
protection cannot be certified from the local preview.

## Verification and repeatable checks

- `npm audit`: zero reported vulnerabilities at review time.
- `python scripts/check_secrets.py`: redacted key-pattern scan of available history and working files.
- `python scripts/check_arcade.py`: five game behavior tests, including minimax branches.
- `python scripts/check_security.py`: five groups testing malformed/oversized inputs, mode switching, exact CSP hashes, headers, absent API routes and browser source maps.
- `npm run build`: TypeScript, static export, CSP and host header generation.
- `python scripts/serve_secure_preview.py`: loopback-only production QA on port 3001. Not a production internet server.
- Browser: production hydration/entrance/app launch succeeded under CSP; Python worker loaded and accepted a Hangman guess; no CSP warnings/errors observed; bad URL showed friendly 404.

To check a deployment, inspect response headers on the actual HTTPS URL and repeat
the entrance and arcade checks. Run audits again before each release. This is a
focused first-pass review, not a penetration-test certification or a guarantee
against all vulnerabilities. No GitHub push or hosting deployment was performed
for these security changes.
