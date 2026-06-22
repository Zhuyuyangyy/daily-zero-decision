# DELIVERY_CHECKLIST.md

Enterprise-Grade Delivery Criteria for `daily-zero-decision` (app/).

Last updated: 2026-06-22

---

## 1. Build & Tooling

- [ ] Node.js >= 20 enforced (`engines.node` in `app/package.json`)
- [ ] `npm ci` runs cleanly from a fresh clone
- [ ] `npm run typecheck` passes (TypeScript strict mode enabled)
- [ ] `npm run lint` passes with zero warnings (`--max-warnings 0`)
- [ ] `npm test` passes (Vitest, jsdom environment)
- [ ] `npm run build` produces a production bundle in `app/dist/`
- [ ] CI workflow `.github/workflows/ci.yml` runs on PR + push to `main`

## 2. Source Quality

- [ ] No `any` types in production source (or justified inline)
- [ ] No unused locals or parameters (TS strict + lint)
- [ ] All public functions/modules have explicit return types where ambiguous
- [ ] No `console.log` left in production code (use logger or remove)
- [ ] No commented-out code blocks larger than 5 lines
- [ ] No TODO/FIXME older than 30 days without an owner

## 3. Testing

- [ ] Unit test coverage for utilities, hooks, and reducers
- [ ] Component tests for shared UI primitives (button, input, modal)
- [ ] At least one happy-path test per feature module
- [ ] Tests are deterministic (no `Date.now()` / `Math.random()` without seeds)
- [ ] Tests run in < 60s locally
- [ ] All tests pass in CI on `ubuntu-latest`

## 4. Security

- [ ] No secrets, API keys, or tokens committed to the repo
- [ ] `.env` files are gitignored
- [ ] Dependencies scanned; no known high/critical CVEs (`npm audit`)
- [ ] All third-party packages have an OSI/FSF-approved license or documented exception
- [ ] `npm ci` uses `package-lock.json` (no floating majors in CI)

## 5. Performance

- [ ] Initial JS bundle < 300 KB gzipped
- [ ] First Contentful Paint < 1.5s on a throttled 4G profile
- [ ] No render loops / infinite re-renders in production
- [ ] Images and assets are optimized (webp/avif where supported)
- [ ] No synchronous network calls on the main render path

## 6. Accessibility

- [ ] All interactive elements are keyboard-reachable
- [ ] Focus rings are visible on all focusable elements
- [ ] All form inputs have associated labels
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for body text)
- [ ] `aria-*` attributes used for non-decorative icons and dynamic regions

## 7. Documentation

- [ ] `app/README.md` exists and is up to date
- [ ] `app/CHANGELOG.md` records user-visible changes
- [ ] Public APIs are documented in code (JSDoc or TSDoc)
- [ ] Setup steps are reproducible from a clean machine
- [ ] This `DELIVERY_CHECKLIST.md` is reviewed and updated per release

## 8. Release Readiness

- [ ] Version in `package.json` reflects the release
- [ ] Git tag created for the release
- [ ] `main` branch is green (all CI jobs pass)
- [ ] At least one peer review approval on the release PR
- [ ] Rollback plan documented in the release notes
- [ ] CHANGELOG entry added under the current version

## 9. Operational

- [ ] `.github/workflows/ci.yml` runs typecheck, lint, test, build
- [ ] CI uses Node 20 and `npm ci` (deterministic installs)
- [ ] CI is required to pass before merge to `main`
- [ ] No long-running `node_modules` in the repo (gitignored)
- [ ] `vercel.json` (or equivalent deploy config) reviewed for the release target

## 10. Compliance & Provenance

- [ ] Source provenance recorded (commit hash + author)
- [ ] No proprietary code copied from outside the organization
- [ ] License headers present where required by org policy
- [ ] `LICENSE` file at repo root is current

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Engineering |   |    |   |
| QA |   |    |   |
| Security |   |    |   |
| Product |   |    |   |
