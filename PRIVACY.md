# Privacy Policy

> **每日零决策卡 · 养一片自己的天空** — Privacy commitments.

## TL;DR

**All your data lives on your device.** It never leaves your device unless **you** explicitly export it. There is no account, no server, no sync, no backup we control, no telemetry, no analytics, and no third-party tracking of any kind.

---

## What data the app stores

The app stores a single JSON object in your browser's `localStorage` under the key `daily-zero-decision`. It contains only:

- **Your tasks** — titles, types (`reading` / `exercise` / `coding` / `other`), optional book names and page numbers, notes you typed, completion timestamps.
- **Your check-in log** — the dates you completed at least one task (used to compute streaks).
- **Your moods** — per-day mood tag (`down` / `low` / `okay` / `gloomy` / `hopeful`).
- **Your streak history** — current and longest streak, last completion date.
- **Your achievements** — which milestone badges you've unlocked (computed locally).
- **Your settings** — default page count, last read position, custom quick-add presets, font preference, onboarding state.
- **Your pomodoro count** — how many focus sessions you've run.
- **Your peace cards** — count and protected dates (a feature flag, not a purchase).
- **Your pet** — species (`cloud_cat`), name, affection level, first-met date, last interaction timestamp.

That's it. Nothing else is collected, generated, or stored.

## What data we DO NOT collect

- Name, email, phone, address, government ID, or any personal identifier.
- IP address, MAC address, advertising ID, or device fingerprint.
- Location, contacts, calendar, photos, microphone, camera — the app never requests these OS permissions.
- Browsing history, search queries, or anything outside the app's own UI.
- Crash logs, error reports, performance metrics, or usage analytics.
- Purchase data — the app has no in-app purchases.

## Where your data lives

| Location | Encrypted at rest? | Notes |
|---|---|---|
| Browser `localStorage` on **your** device | Only if your OS / browser encrypts it (most modern browsers do for the profile). | The only place your data exists. |
| Anywhere else | N/A | It doesn't exist anywhere else. |

We do not operate a backend. We do not have a database. There is no copy of your data sitting on a server waiting to be breached, subpoenaed, or accidentally leaked — because there is no server.

## When data leaves your device

Only in two cases, both fully under your control:

1. **You tap "Export Backup"** — the app generates a JSON file (`daily-cloud-backup-YYYY-MM-DD.json`) using a browser `Blob`. You choose where to save it (Downloads folder, iCloud Drive, a USB stick, etc.). The app does not upload it anywhere. After the download, the temporary in-memory URL is revoked.

2. **You tap an external link inside the app** — some content may link to your browser (e.g. a "view source" link). That opens in a new tab with normal browser semantics; the destination website's privacy policy then applies.

That is the complete list. There are no other egress paths.

## When data enters your device

Only in two cases:

1. **You tap "Import Backup"** — you choose a JSON file from your own disk. The app parses it locally, validates the schema, and merges into your `localStorage`. The file is not sent anywhere.

2. **You install / update the app** — you fetch the static JS/CSS/HTML bundle from wherever you host it (GitHub Pages, Vercel, your own server). This is normal web loading; once loaded, the app makes zero further requests.

## Children's privacy

The app does not target children under 13 (or the equivalent age in your jurisdiction) and does not knowingly collect data from anyone. Because nothing is collected at all, COPPA / GDPR-K / equivalent obligations are structurally satisfied: there is no data to protect because there is no data to collect.

## International users

Because the app never transfers data across borders (there is no transfer — there is no server), data residency / cross-border transfer laws (GDPR, China PIPL, Brazil LGPD, etc.) are not engaged. Your data stays where you put it.

## Your rights

Because we do not hold any of your data, you do not need to ask us to delete, export, or correct it. **You already have full control:**

| Right | How to exercise |
|---|---|
| Access | Open the app — everything is visible. |
| Export | Settings → "Export Backup" → save the JSON file. |
| Correct | Edit tasks directly in the Today tab, or edit the exported JSON and re-import. |
| Delete | Settings → "Reset All Data", or `localStorage.removeItem('daily-zero-decision')` in DevTools, or clear site data in browser settings, or uninstall. |
| Portability | The export format is plain JSON. See `DATA_MODEL.md`. |
| Object / restrict processing | There is no processing to object to. The app runs entirely on your CPU. |

## Changes to this policy

If we ever add a feature that changes the privacy posture — for example, optional cloud sync — we will:

1. Bump the major version and document it in `CHANGELOG.md`.
2. Update this file **before** shipping the feature.
3. Make the new behavior opt-in (off by default), so existing users see no change.

---

_Last updated: 2026-06-22. Schema: `0.1.0`._