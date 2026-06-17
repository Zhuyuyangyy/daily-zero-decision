# Full-Stack Spring Boot + Vue 3 Scaffold Template — Design

**Date:** 2026-06-18
**Status:** Approved (round 1 — user confirmed §1 decisions: MySQL 8, `/api/v1/...`, cache/search/storage/rate-limit/audit as interface-only stubs)

---

## 1. Goal

Turn `twice_hand_system/` into a **reusable full-stack scaffold template**:

- Next project can `git clone` → rename `com.campus.secondhand` → replace the example domain (user/goods/order) with their own → ship.
- The example domain stays end-to-end runnable as a working reference: backend boots, MySQL migrates, frontend builds, login + CRUD all work.
- Production-grade "seams" (cache, search, object storage, rate limiting, audit) are present as interfaces with stub implementations — close to real, but the stubs are the default so the template runs without extra infra.

**Non-goals:** microservices, real Redis/ES/MinIO integration, payment, IM, ML, anything beyond what's needed to demonstrate each layer.

---

## 2. Architecture (final)

### 2.1 System diagram

```
┌────────────────────────────────────────────────────────────┐
│                    Browser (Vue 3 SPA)                     │
│   pages  ──▶  stores/pinia  ──▶  api/axios  ──▶  JWT       │
│                                    │                       │
└────────────────────────────────────┼───────────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────────────┐
│                  Nginx (reverse proxy)                     │
│         /api/*  ──▶  app:8080                               │
│         /*      ──▶  frontend dist/ (static)                │
└────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────┐
│  Spring Boot App (single executable JAR, jdk17)            │
│                                                            │
│   controller ──▶ service ──▶ mapper(MyBatis-Plus)           │
│       │             │                                      │
│       │             ▼                                      │
│       │      security/JwtUtil (access+refresh)             │
│       │      cache/CacheService (interface + Noop impl)     │
│       │      search/SearchService (interface + Noop impl)   │
│       │      storage/StorageService (interface + Noop impl)│
│       │      ratelimit/RateLimiter (interface + Noop impl) │
│       │      audit/AuditLogger (AOP + Noop impl)           │
│       │             │                                      │
│       ▼             ▼                                      │
│   exception/GlobalExceptionHandler ──▶ Result<T>           │
│       │                                                    │
│       ▼                                                    │
│   interceptor/JwtInterceptor ──▶ WebConfig (CORS+paths)    │
│                                                            │
└────────────────────────────────────────────────────────────┘
                │
                ▼
            MySQL 8 (only required runtime dep)
```

### 2.2 Confirmed decisions

| Topic | Decision |
|-------|----------|
| Database | MySQL 8.0 (only required runtime dependency) |
| API path prefix | `/api/v1/...` (fixes the current interceptor bug where `WebConfig` registers `/api/**` but controllers live at `/user/**` etc.) |
| Password hashing | BCrypt (Spring Security crypto) — replaces MD5 |
| Auth | JWT access (15 min) + refresh token (7 d), refresh token in HttpOnly cookie, sliding renewal |
| ORM | MyBatis-Plus 3.5.3.1 (unchanged) |
| Migrations | Flyway 8, `src/main/resources/db/migration/V1__init.sql` |
| Frontend build | Vite 5 + Vue 3 + Pinia + Vue Router 4 + Axios |
| Frontend fallback | Keep `frontend/index.html` as CDN-only zero-build entry that talks to the same backend |
| Production seams (stubs) | `cache`, `search`, `storage`, `ratelimit`, `audit` — interface + Noop impl + `@ConditionalOnProperty` switches |
| Docker | `docker-compose.yml` runs MySQL + App + optional Nginx profile; Redis/ES/MinIO not included (not needed) |

---

## 3. Directory layout

### 3.1 Backend (after refactor)

```
src/main/java/com/campus/secondhand/
├── SecondhandApplication.java
├── config/
│   ├── MyMetaObjectHandler.java        # existing — keep
│   ├── WebConfig.java                  # rewrite: paths = /api/v1/**
│   ├── OpenApiConfig.java              # NEW — springdoc-openapi
│   └── AsyncConfig.java                # NEW — @Async executor
├── controller/
│   ├── UserController.java             # /api/v1/users/**
│   ├── AuthController.java             # NEW — login/refresh/logout split
│   ├── GoodsController.java            # /api/v1/goods/**
│   └── OrderController.java            # /api/v1/orders/**
├── dto/
│   ├── LoginRequest.java               # existing
│   ├── RegisterRequest.java            # existing
│   ├── GoodsCreateRequest.java         # NEW — replaces raw Goods body
│   ├── GoodsUpdateRequest.java         # NEW
│   ├── OrderCreateRequest.java         # NEW
│   └── PageResponse<T>.java            # NEW — {records, total, page, size}
├── entity/
│   ├── BaseEntity.java                 # NEW — id, createTime, updateTime, deleted
│   ├── User.java                       # extends BaseEntity; BCrypt password
│   ├── Goods.java                      # extends BaseEntity
│   └── Order.java                      # extends BaseEntity; add orderNo + snapshot
├── enums/
│   ├── ResultCode.java                 # NEW — enum for status codes
│   ├── GoodsStatus.java                # NEW
│   └── OrderStatus.java                # NEW
├── exception/
│   ├── BusinessException.java          # existing — make it carry ResultCode
│   ├── GlobalExceptionHandler.java     # rewrite: handle BusinessException, MethodArgumentNotValid, AccessDenied, fallback
│   └── ErrorCode.java                  # NEW — codes table
├── interceptor/
│   └── JwtInterceptor.java             # rewrite: pull userId, set SecurityContext-like holder
├── security/
│   ├── JwtUtil.java                    # rewrite: access + refresh, jjwt 0.11.5
│   ├── PasswordEncoderConfig.java      # NEW — BCrypt bean
│   ├── CurrentUser.java                # NEW — @CurrentUser Long userId arg resolver
│   ├── CurrentUserArgResolver.java     # NEW
│   └── WebMvcSecurityConfig.java       # NEW — registers arg resolver
├── cache/
│   ├── CacheService.java               # interface: get/put/evict
│   └── NoopCacheService.java           # @ConditionalOnProperty(cache.enabled=false)
├── search/
│   ├── SearchService.java              # interface
│   └── NoopSearchService.java
├── storage/
│   ├── StorageService.java             # interface
│   └── NoopStorageService.java
├── ratelimit/
│   ├── RateLimiter.java                # interface
│   ├── NoopRateLimiter.java            # default
│   └── RateLimited.java                # annotation
├── audit/
│   ├── AuditLogger.java                # interface
│   ├── NoopAuditLogger.java
│   └── Audited.java                    # annotation; AOP aspect cuts in when real impl is wired
├── mapper/
│   ├── UserMapper.java
│   ├── GoodsMapper.java
│   └── OrderMapper.java
├── response/
│   └── Result.java                     # rewrite: code/message/data + static ok/error + timestamp
└── service/
    ├── UserService.java
    ├── AuthService.java                # NEW — login/refresh/logout orchestration
    ├── GoodsService.java
    ├── OrderService.java
    └── impl/
        ├── UserServiceImpl.java
        ├── AuthServiceImpl.java
        ├── GoodsServiceImpl.java
        └── OrderServiceImpl.java

src/main/resources/
├── application.yml                     # rewrite — see §4
├── application-dev.yml                 # NEW — local profile
├── application-prod.yml                # NEW — prod profile
├── db/migration/
│   └── V1__init.sql                    # rewritten from existing init.sql, schema+entity aligned
└── mapper/
    ├── UserMapper.xml
    ├── GoodsMapper.xml
    └── OrderMapper.xml
```

### 3.2 Frontend (split from single index.html)

```
frontend/
├── index.html              # CDN-only zero-build fallback (kept; talks to /api/v1)
├── package.json            # NEW
├── vite.config.ts          # NEW — proxy /api → localhost:8080
├── tsconfig.json           # NEW
├── env.d.ts                # NEW
├── .env.development        # NEW
├── .env.production         # NEW
├── README.md               # NEW — frontend dev/build guide
└── src/
    ├── main.ts
    ├── App.vue
    ├── router/
    │   └── index.ts        # routes: /, /login, /register, /goods, /goods/:id, /orders, /me
    ├── stores/
    │   ├── auth.ts         # Pinia — token, currentUser, login/logout/refresh
    │   ├── goods.ts
    │   └── orders.ts
    ├── api/
    │   ├── http.ts         # axios instance, request/response interceptors, refresh-on-401
    │   ├── auth.ts
    │   ├── goods.ts
    │   └── orders.ts
    ├── components/
    │   ├── AppHeader.vue
    │   ├── AppNav.vue
    │   ├── GoodsCard.vue
    │   ├── GoodsForm.vue
    │   ├── OrderRow.vue
    │   ├── Pagination.vue
    │   └── Toast.vue
    ├── views/
    │   ├── HomeView.vue        # goods list + publish form
    │   ├── LoginView.vue
    │   ├── RegisterView.vue
    │   ├── GoodsManageView.vue
    │   ├── OrderManageView.vue
    │   └── MyGoodsView.vue
    ├── types/
    │   ├── user.ts
    │   ├── goods.ts
    │   └── order.ts
    └── utils/
        ├── format.ts
        └── validation.ts
```

### 3.3 Repo-root changes

- `.gitignore` — add `相关功能测试.mp4`, `-p/`, `../llm-autoresearch-pipeline/`, `../新建文件夹/`, `frontend/node_modules/`, `frontend/dist/`, `.idea/`, `target/`
- Keep `Dockerfile`, rewrite `docker-compose.yml` to use `app` profile + optional `nginx` profile; remove references to non-existent `nginx.conf` (will create one under `deploy/nginx/`)
- New: `deploy/nginx/default.conf`
- New: `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `docs/PRODUCTION_CHECKLIST.md`
- Rewrite: `README.md` (scaffold usage), `TODO.md` (template-level tasks only)
- Keep: `pom.xml` (add deps: springdoc-openapi, flyway, spring-security-crypto)
- Keep: `.github/workflows/ci.yml` (works as-is)

---

## 4. Data flow

### 4.1 Backend request lifecycle

```
HTTP request
   │
   ▼
JwtInterceptor.preHandle          # skip OPTIONS, validate token (if required), set userId attr
   │
   ▼
Controller method                 # @RequestBody DTO, @CurrentUser Long userId (via arg resolver)
   │
   ▼
Service method                    # @Transactional, calls mapper / cache / search / storage
   │                               # @RateLimited("login") on AuthService.login (skipped when stub)
   │                               # @Audited on mutating methods (skipped when stub)
   ▼
Mapper (MyBatis-Plus)             # auto-fill createTime/updateTime via MyMetaObjectHandler
   │
   ▼
Result<T>                         # uniform envelope: {code, message, data, timestamp}
```

### 4.2 Frontend request lifecycle

```
User action (component) ──▶ Pinia store action ──▶ api/http.ts (axios)
                                                       │
                                                       ▼
                                  request interceptor: attach Authorization: Bearer
                                                       │
                                                       ▼
                                          Spring Boot (intercepted, dispatched)
                                                       │
                                                       ▼
                                  response interceptor: unwrap Result; on 401 try /auth/refresh once
                                                       │
                                                       ▼
                                            Pinia store updates state
                                                       │
                                                       ▼
                                          Vue components re-render reactively
```

### 4.3 Page-size & page-num contract

- Backend list endpoints return `PageResponse<T>` = `{ records: T[], total, page, size }` — replaces current `List<Goods>` shape that breaks the frontend's `res.data.data.records` access.
- Frontend `Pagination.vue` uses `page` (1-based) and `size` query params. MyBatis-Plus `Page` is 1-based; matches.

### 4.4 SQL ↔ entity alignment (key fixes)

| Table | Column | Old entity | New entity |
|-------|--------|------------|------------|
| `users` | `password` | MD5 32-char | BCrypt 60-char |
| `goods` | `title` | mapped as `name` | align: `name` → `title` OR rename column to `name` (decision: **rename column to `name`**, fewer Java changes) |
| `goods` | `category_id`/`category_name` | missing | add to entity |
| `orders` | `order_no` | missing | add `@TableField("order_no")` |
| `orders` | `goods_title`/`goods_price` snapshot | missing | add snapshot fields |
| all | `deleted` | present in SQL, used via MyBatis-Plus global config but no field | add `@TableLogic` field on BaseEntity |

`V1__init.sql` rewrites the existing `init.sql` so MySQL boots cleanly with the new entities.

### 4.5 application.yml structure

```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:school_secondary}?...
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:}
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET:change-me-in-production-min-32-bytes}
  access-expire-seconds: 900        # 15 min
  refresh-expire-seconds: 604800     # 7 d

mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0

# Template seam switches — turn on in prod profile, off in dev
template:
  cache:
    enabled: false
  search:
    enabled: false
  storage:
    enabled: false
  ratelimit:
    enabled: false
  audit:
    enabled: false
```

---

## 5. Error handling

### 5.1 Error model

- `ErrorCode` enum: `code` (int), `message` (default), `httpStatus` (int). Example: `OK(200, "ok", 200)`, `BAD_REQUEST(40000, "bad request", 400)`, `UNAUTHORIZED(40100, "unauthorized", 401)`, `FORBIDDEN(40300, "forbidden", 403)`, `NOT_FOUND(40400, "not found", 404)`, `CONFLICT(40900, "conflict", 409)`, `INTERNAL(50000, "internal error", 500)`.
- `Result<T>` carries `code`, `message`, `data`, `timestamp` (epoch ms).

### 5.2 Exception flow

```
Service throws BusinessException(ErrorCode.X, "msg")
        │
        ▼
GlobalExceptionHandler.handleBusinessException  ──▶ Result with ErrorCode
        │
        ▼
HTTP response 200 with body {code: 40000, message: "...", data: null, timestamp: ...}
UNLESS: when ErrorCode.httpStatus != 200, response status matches
```

Other handlers:
- `MethodArgumentNotValidException` (Bean Validation) → `Result` with first field error message, code `40000`.
- `AccessDeniedException` → 403, code `40300`.
- `Exception` (fallback) → 500, code `50000`, message "internal error" (no stacktrace leak in prod).

### 5.3 Frontend error display

- `api/http.ts` rejects with `ApiError { code, message, httpStatus }`.
- Stores catch and surface via `Toast` component. Auth 401 triggers one refresh attempt; on second failure, route to `/login`.

---

## 6. Testing

### 6.1 Backend

- JUnit 5 + Mockito (existing) + H2 (test scope, existing).
- Tests by layer:
  - **Service unit:** mock mappers, exercise happy + business-rule paths. Cover at least:
    - `UserService.register` — duplicate username/phone, BCrypt hashing
    - `AuthService.login` — wrong password, disabled user, success → token pair
    - `AuthService.refresh` — expired/invalid/rotated token
    - `GoodsService.create` — sets userId, auto-fills createTime via meta handler
    - `OrderService.create` — generates `orderNo` (e.g. `yyyyMMddHHmmssSSS-uuid`), snapshots goods title/price
    - `OrderService.updateStatus` — illegal transitions rejected
  - **Controller integration:** `@WebMvcTest` + MockMvc, verify:
    - Public paths bypass JWT (`/api/v1/auth/login`, `/api/v1/goods`)
    - Protected paths return 401 without token, 200 with token
    - `Result` envelope shape correct
  - **Slice tests:** `JwtUtilTest` (existing) — sign/parse/expire/refresh rotation.

### 6.2 Frontend

- Vitest + Vue Test Utils for components and stores.
- `api/http.ts` interceptor: mock axios, verify 401 retry + refresh, headers attached.
- Stores: login flow, logout clears token, refresh on expiry.
- Smoke: `HomeView` renders goods list from mocked store.

### 6.3 CI

- Keep existing `.github/workflows/ci.yml` (Maven build + test). Add `frontend` job: `npm ci && npm run build` (smoke build only — no unit-test gate by default; template shouldn't dictate test framework choice beyond what's documented).

---

## 7. Documentation

- `README.md` — 5-minute quickstart: clone → set `JWT_SECRET` → `docker compose up -d mysql` → `mvn spring-boot:run` → open `http://localhost:8080/`. Three commands, no setup.
- `docs/ARCHITECTURE.md` — package responsibilities, request lifecycle, how to swap stub interfaces for real impls (e.g. add `RedisCacheService` implementing `CacheService` and flip `template.cache.enabled=true`).
- `docs/CONVENTIONS.md` — naming, error handling, transaction boundaries, when to add `@Transactional`, DTO vs entity rules, page response shape, where to put new modules.
- `docs/PRODUCTION_CHECKLIST.md` — checklist: change `JWT_SECRET`, enable BCrypt (default), set rate limit on `/auth/login`, enable audit on mutations, set up log aggregation, health endpoints, CORS allowlist.
- `frontend/README.md` — `npm run dev` / `npm run build` / zero-build CDN mode.

---

## 8. Migration plan (high level)

| Phase | Work | Risk |
|-------|------|------|
| P1 — Stabilize backend | Fix interceptor path → `/api/v1`, fix SQL/entity alignment, replace MD5 with BCrypt, add Flyway, rewrite `Result`, add `ErrorCode`/`BusinessException` flow. | Low — touches all controllers and entities but no behavior change. |
| P2 — Add template seams | Add `cache/search/storage/ratelimit/audit` interfaces + Noop impls + config switches. | Low — purely additive, default off. |
| P3 — Frontend split | Vite scaffold under `frontend/`, move logic from `index.html`, add Pinia stores, axios interceptors, refresh-on-401. Keep CDN `index.html` as fallback. | Medium — biggest single change. |
| P4 — Tests + CI | Refresh unit tests, add controller slice tests, Vitest setup, CI jobs. | Low. |
| P5 — Docs + .gitignore | Rewrite README, write ARCHITECTURE/CONVENTIONS/CHECKLIST, update .gitignore to keep residue out of repo. | None. |

Each phase ends with `mvn test` green, `npm run build` green, and a runnable backend.

---

## 9. Out of scope (explicit)

- Real Redis/ES/MinIO wiring (interfaces only; the user opted in to "no extra deps").
- Microservices, service mesh, message queues.
- Payment, IM, push notifications, ML features.
- Migrating to Spring Boot 3.x or jdk21 (stays on Spring Boot 2.7.18 / jdk17 — current versions).
- Domain change — example remains campus second-hand; the template *facilitates* swapping, doesn't do the swap.
