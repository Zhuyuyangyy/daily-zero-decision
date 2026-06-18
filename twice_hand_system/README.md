# Campus SecondHand — Full-Stack Scaffold Template

A reusable Spring Boot 2.7 + Vue 3 scaffold with JWT (access + refresh), MyBatis-Plus, Flyway, Vite, Pinia, and 5 production-grade "seam" interfaces (cache, search, storage, rate-limit, audit) that ship as no-op by default.

The example domain (campus second-hand trading) is wired end-to-end as a working reference: register, login, list/create goods, place orders, manage orders.

## 5-minute quickstart

```bash
# 1. Start MySQL (or use docker compose — see below)
docker compose up -d mysql

# 2. Run the backend
mvn spring-boot:run

# 3. In another terminal — run the frontend
cd frontend
npm install
npm run dev

# 4. Open
# Backend:   http://localhost:8080/swagger-ui.html
# Frontend:  http://localhost:5173
# OpenAPI:   http://localhost:8080/v3/api-docs
```

Default dev profile reads from `application-dev.yml` (env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

## Full stack with Docker

```bash
docker compose up -d        # mysql + app
# Open http://localhost:8080  (frontend served by app profile's static mapping; or run `npm run dev` separately)
```

## What you get

- **Auth:** JWT access (15 min) + refresh (7 d), BCrypt password hashing, sliding refresh.
- **API:** RESTful under `/api/v1`, uniform `Result<T>` envelope (`{code, message, data, timestamp}`).
- **Persistence:** MySQL 8 + MyBatis-Plus + Flyway migrations in `src/main/resources/db/migration/`.
- **Frontend:** Vite 5 + Vue 3 + Pinia + Vue Router 4 + Axios with refresh-on-401 interceptor. A CDN-only `frontend/index.cdn.html` is kept as zero-build fallback.
- **Template seams:** `CacheService`, `SearchService`, `StorageService`, `RateLimiter`, `AuditLogger` — all interfaces with Noop impls. Flip `template.<name>.enabled=true` and add a real impl to switch on.

## Project layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Coding rules: [docs/CONVENTIONS.md](docs/CONVENTIONS.md). Production checklist: [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md).

## Replacing the example domain

1. Drop or rename the `goods` and `orders` tables in `V1__init.sql` and `V2__<your-domain>.sql`.
2. Replace `entity/`, `service/`, `controller/`, `mapper/`, `dto/` contents.
3. Update `frontend/src/views/`, `stores/`, `api/`, `types/`.
4. Keep the interfaces in `cache/`, `search/`, `storage/`, `ratelimit/`, `audit/` — they don't care about the domain.

## Testing

```bash
mvn test                # 18 unit tests across 5 classes
cd frontend && npm test # 1 smoke test for axios interceptor
```

## License

MIT.
