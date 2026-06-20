# TODO

Template-level tasks. Domain tasks (login, goods, orders) are tracked in `docs/ARCHITECTURE.md` and code, not here.

- [ ] Add a real `RedisCacheService` impl behind `template.cache.enabled`.
- [ ] Add a real `ElasticsearchSearchService` impl behind `template.search.enabled`.
- [ ] Add a real `MinIOStorageService` impl behind `template.storage.enabled`.
- [ ] Wire a real rate-limiter (Bucket4j + Redis Lua) behind `template.ratelimit.enabled`.
- [ ] Wire a real audit sink (DB table or Kafka) behind `template.audit.enabled`.
- [ ] Add Spring Boot Actuator and Prometheus micrometer.
- [ ] Replace `digest` log line in `GlobalExceptionHandler` with structured fields.
- [ ] Add `idempotency-key` header support for `POST /api/v1/orders`.
- [ ] Add WebSocket endpoint for real-time order status push.
- [ ] Add a CI step that boots MySQL via Testcontainers and runs the smoke script.
