# Conventions

## Naming

- Java packages: `com.campus.secondhand.<layer>` (e.g. `controller`, `service`, `cache`).
- Classes: PascalCase. Interfaces end with their role (e.g. `CacheService`, `RateLimiter`).
- DTO suffix: `*Request` for input, `*Response` for output, no suffix for value objects.
- Tables: snake_case in MySQL; MyBatis-Plus maps to camelCase. `users` is the convention; singular is fine too — be consistent within one project.

## Errors

- Throw `BusinessException(ErrorCode.XXX, "message")` from services. Never throw `RuntimeException` directly.
- Add new error codes by extending `ErrorCode` — do not hard-code integer codes in services.
- Validation failures flow through `MethodArgumentNotValidException` automatically when you put `@Valid` on `@RequestBody` parameters.

## Transactions

- `@Transactional` on the service method, not the class. Read-only methods use `@Transactional(readOnly = true)`.

## Pagination

- Backend list endpoints return `PageResponse<T>` = `{records, total, page, size}`. Use `PageResponse.of(mybatisPlusPage)`.
- Frontend pages send `page` and `size` as query params (1-based).

## Frontend

- Components use `<script setup lang="ts">`.
- API calls go through `frontend/src/api/*.ts` modules; components call those, never `axios` directly.
- State goes in Pinia stores (`frontend/src/stores/*.ts`); components stay stateless beyond form bindings.
- Types live in `frontend/src/types/*.ts` and mirror backend DTOs.
