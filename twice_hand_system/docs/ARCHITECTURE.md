# Architecture

## Layers

- `controller/` — HTTP entry. Throws `BusinessException` on domain errors; never catches generic `Exception` (handled globally).
- `service/` — business logic. `@Transactional` at the service-method level, not the class.
- `mapper/` — MyBatis-Plus interfaces. Custom SQL only when `QueryWrapper` isn't expressive enough; otherwise keep it in Java.
- `entity/` — extends `BaseEntity` (createTime/updateTime/deleted). `@TableLogic` on `deleted` enables soft delete globally.
- `dto/` — request/response shapes. Never return entities directly from controllers.
- `enums/` — domain enums and `ErrorCode`.
- `exception/` — `BusinessException` carries an `ErrorCode`. `GlobalExceptionHandler` maps to `Result<T>` and HTTP status.
- `interceptor/` — `JwtInterceptor` extracts and validates the access token, sets `currentUserId` on the request.
- `response/Result.java` — the single response envelope.

## Cross-cutting seams

Each seam is an interface in its own package with a Noop default and a `@ConditionalOnProperty` switch:

| Seam | Interface | Default impl | Switch |
|------|-----------|--------------|--------|
| Cache | `cache.CacheService` | `NoopCacheService` | `template.cache.enabled` |
| Search | `search.SearchService` | `NoopSearchService` | `template.search.enabled` |
| Object storage | `storage.StorageService` | `NoopStorageService` | `template.storage.enabled` |
| Rate limit | `ratelimit.RateLimiter` | `NoopRateLimiter` | `template.ratelimit.enabled` |
| Audit | `audit.AuditLogger` | `NoopAuditLogger` | `template.audit.enabled` |

To enable a seam:

1. Implement the interface (e.g. `RedisCacheService implements CacheService`).
2. Remove the `@ConditionalOnProperty(matchIfMissing=true)` from the Noop impl, or qualify the real impl with `havingValue="true"`.
3. Add the implementation class to the classpath.
4. Flip the property in `application-prod.yml`.

## Auth flow

1. `POST /api/v1/auth/login` returns `{accessToken, refreshToken, accessExpiresIn, user}`.
2. Frontend stores both in `localStorage`; axios attaches `Authorization: Bearer <accessToken>`.
3. On 401, axios calls `POST /api/v1/auth/refresh` once with the refresh token; on success, retries the original request. On second failure, routes to `/login`.

## Database migrations

Flyway files live in `src/main/resources/db/migration/`, named `V<n>__<description>.sql`. Never edit a `V<n>__` after it has been applied — add a new `V<n+1>__`.
