# Production Checklist

Before deploying, verify:

## Security

- [ ] `JWT_SECRET` is set to a random 32+ byte value (env var).
- [ ] HTTPS is terminated at the load balancer; `server.forward-headers-strategy=framework` is set.
- [ ] CORS allowlist is set to the real frontend origin (not `*`).
- [ ] Database credentials are not default; the app user has only the privileges it needs.
- [ ] BCrypt is the only password encoder (`SecurityConfig`).

## Persistence

- [ ] Flyway migrations have been tested on a staging DB.
- [ ] Backups are scheduled and tested.
- [ ] Connection pool sizing matches the load profile.

## Operations

- [ ] Health endpoint exposed (Spring Actuator if not already).
- [ ] Logs are structured (JSON) and shipped to a log aggregator.
- [ ] Metrics are exported to Prometheus (or your platform's equivalent).
- [ ] Tracing is wired (request IDs propagate through).

## Template seams

- [ ] Decide which seams to enable in prod: cache, search, storage, rate-limit, audit.
- [ ] For each enabled seam, add a real implementation and flip the property in `application-prod.yml`.
- [ ] Add a `@RateLimited("auth.login")` annotation on `AuthController.login` if rate-limit is on.
- [ ] Add `@Audited("goods.create")` etc. on mutating service methods if audit is on.

## Frontend

- [ ] `npm run build` succeeds; `dist/` is uploaded to a CDN or served by the reverse proxy.
- [ ] The CDN `frontend/index.cdn.html` is removed (or kept only for local dev).
- [ ] CSP and other security headers are configured on the reverse proxy.
