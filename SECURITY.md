# Security Policy

> **每日零决策卡 · 养一片自己的天空** — Security commitments.

## TL;DR

This app is **offline-first, zero-network by default**. There is no backend, no telemetry, no analytics, no third-party tracking, and no auto-update channel. The only network calls the app can make are ones **you** trigger (e.g. opening an external link you tapped).

---

## What we DO

| Practice | Detail |
|---|---|
| Local-only persistence | All your data is stored in your browser's `localStorage` (key: `daily-zero-decision`). Nothing is written to a server. |
| User-initiated export only | JSON export uses a browser `Blob` + `<a download>` — no upload step, no network round-trip. |
| Static, auditable build | Frontend is plain React + Vite + TypeScript. No hidden runtime fetches, no remote code loading. |
| Minimal dependency surface | Runtime deps: `react`, `react-dom`. Every dev dep is pinned and auditable in `app/package.json`. |
| Open source / inspectable | The full source is in this repo. You can `grep` for `fetch(`, `XMLHttpRequest`, `axios`, `sendBeacon`, etc. — there are none. |
| Honest state migration | On import, the schema is validated and migrated forward/backward with explicit defaults. Bad input is rejected, never silently merged. |

## What we DO NOT do

| Anti-pattern | Status |
|---|---|
| Telemetry / usage analytics | **No.** No Google Analytics, Plausible, PostHog, Mixpanel, Sentry, Amplitude, or any equivalent SDK is bundled. |
| Crash reporting | **No.** We do not collect crash logs, stack traces, or device fingerprints. |
| Third-party tracking pixels | **No.** No Facebook Pixel, TikTok Pixel, Google Tag, etc. |
| Remote configuration / feature flags | **No.** No LaunchDarkly, Statsig, ConfigCat, or remote-controlled code paths. |
| Auto-updates / phone-home | **No.** Updates ship only when you pull this repo and rebuild. The deployed bundle is fully self-contained. |
| Advertising / ad networks | **No.** No ad SDKs, no ad attribution, no IDFA / OAID collection. |
| Social login / OAuth | **No.** No accounts, no sign-in, no identity provider redirects. |
| Push notifications | **No.** No FCM, APNs, Web Push, or notification service workers. |
| Cookies (tracking) | **No.** `localStorage` is used purely for your own data. No third-party cookies, no fingerprinting cookies. |
| Backend database | **No.** There is no server. There is nothing to breach. |
| IP / device collection | **No.** The app never sees your IP, because it never makes a request. |
| AI / LLM API calls | **No.** No OpenAI, Anthropic, or any model API is called. All "intelligence" (task parsing, mood inference, pet mood) is local. |

---

## How to verify

You don't have to take this document on faith. You can audit the app yourself:

1. **Search the source for network calls:**
   ```bash
   cd app && grep -rn "fetch(\|axios\|XMLHttpRequest\|sendBeacon\|navigator.geolocation" src/
   ```
   Expected: no matches (other than the import/export file picker, which is local-only).

2. **Inspect the bundled output:**
   ```bash
   cd app && npm run build
   grep -E "google-analytics|sentry|amplitude|posthog|facebook.net|doubleclick" dist/assets/*.js
   ```
   Expected: no matches.

3. **Inspect network activity at runtime:**
   Open DevTools → Network tab. Use the app for a full day. Expected: zero requests, except any external links you tap yourself.

4. **Inspect storage:**
   Open DevTools → Application → Local Storage. You'll see exactly one key: `daily-zero-decision`. That key contains your entire app state, in plain JSON.

---

## Reporting a vulnerability

Even though the attack surface is minimal, mistakes happen.

- **Where:** Open a GitHub issue titled `security:` or email the maintainer (see `README.md`).
- **What to include:** Reproduction steps, affected commit SHA, expected vs. actual behavior.
- **Response SLA:** We aim to acknowledge within 7 days and triage within 30 days.
- **Scope:** Anything that causes the app to leak user data, contact an unapproved endpoint, or execute code outside the documented local-only contract.

---

## Data deletion

Because everything is local, **uninstalling the app (or clearing site data) deletes everything**. There is no remote copy to purge.

If you want a clean slate without losing the app:
- Settings → "Reset All Data" → confirm.
- Or in DevTools: `localStorage.removeItem('daily-zero-decision')`.

---

## Supply chain

- Dependencies are pinned via `package-lock.json` (committed).
- Run `npm audit` (or `pnpm audit`) in `app/` to check for known vulnerabilities in the locked dependency tree.
- We do **not** auto-update dependencies. Every bump is a deliberate, reviewed PR.

---

_Last updated: 2026-06-22. Schema: `0.1.0`._