# Plan de Mejora — Bersulm Backend

Basado en las skills: `nodejs-backend-patterns`, `nodejs-best-practices`, `nodejs-express-server`.

---

## ✅ Fase 1 — Críticas (Seguridad y Estabilidad)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | `express-mongo-sanitize` + `hpp` + `compression` | ✅ |
| 2 | Fix CORS cuando `ALLOWED_ORIGINS` vacío | ✅ |
| 3 | Inyectar `BcryptService` en `LoginUseCase` (salt 12) | ✅ |
| 4 | Unificar response format (`status` → `success`) en todos los controllers | ✅ |
| 5 | Reemplazar `console.log` por pino en `RaffleCron.js` + `errorHandler.js` | ✅ |
| 6 | Fix graceful shutdown (race condition + timeout 30s + exitCode) | ✅ |
| 7 | Eliminar `morgan` (obsoleto) de dependencias | ✅ |
| 8 | Request ID middleware con `uuid` (`x-request-id` header) | ✅ |

## ✅ Fase 2 — Calidad y DX

| # | Tarea | Estado |
|---|-------|--------|
| 9 | ESLint + Prettier + scripts `lint`/`lint:fix`/`format`/`format:check` | ✅ |
| 10 | Husky + lint-staged pre-commit hooks | ✅ |
| 11 | Validación `express-validator` en rutas faltantes (PUT/DELETE, gallery, loyalty, spin) | ✅ |
| 12 | Paginación en `getUserAppointments` con `ApiResponse.paginated` | ✅ |
| 13 | Tests: 6 suites, 23 tests (unitarios + integración) | ✅ |
| 14 | CI pipeline con GitHub Actions (lint + test en push/PR) | ✅ |
| 15 | Dockerfile + docker-compose + .dockerignore | ✅ |

## ✅ Fase 3 — Documentación y Monitoreo

| # | Tarea | Estado |
|---|-------|--------|
| 16 | Swagger/OpenAPI docs en `/api/v1/docs` | ✅ |
| 17 | Health check mejorado (DB ping, uptime, memoria, degraded state) | ✅ |
| 18 | `compression` middleware (gzip responses) | ✅ |
| 19 | Request ID con `uuid` para tracing | ✅ |
| 20 | `.gitignore` completo + `.env.example` actualizado | ✅ |

## ✅ Fase 4 — Nice-to-Have

| # | Tarea | Estado |
|---|-------|--------|
| 21 | File upload: `multer` + Cloudinary para galería | ✅ |
| 22 | WebSockets: `socket.io` con eventos de appointments, raffles, loyalty | ✅ |
| 23 | Índices en `ServiceModel` (`category + isActive`, `order`) | ✅ |
| 24 | Cobertura de tests (`jest --coverage`) | ✅ |
| 25 | Fix `import.meta.url` cross-platform en `seed.js` | ✅ |
| 26 | Dead code cleanup: `findAvailableSlots()` duplicado eliminado | ✅ |

---

## Resumen de cambios

### Nuevos archivos
- `src/shared/middlewares/requestId.js`
- `src/shared/middlewares/upload.js` (multer + Cloudinary)
- `src/shared/infrastructure/socket/SocketManager.js`
- `src/config/swagger.js`
- `eslint.config.js`
- `.prettierrc`
- `.github/workflows/ci.yml`
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `tests/unit/ApiResponse.test.js`
- `tests/unit/SlotsHelper.test.js`
- `tests/unit/DomainError.test.js`
- `tests/unit/CreateRewardUseCase.test.js`

### Dependencias agregadas
- `express-mongo-sanitize`, `hpp`, `compression`
- `swagger-jsdoc`, `swagger-ui-express`
- `multer`, `cloudinary`
- `socket.io`
- `uuid`
- `eslint`, `prettier`, `husky`, `lint-staged`, `globals`, `@eslint/js`

### Dependencias eliminadas
- `morgan` (reemplazado por pino-http)

---

**Tests:** 23/23 pasando ✅
**Cobertura:** Configurada con Jest --coverage
**CI/CD:** GitHub Actions (lint + test)
**Docs:** Swagger en `/api/v1/docs`
**WebSockets:** Socket.io para eventos en tiempo real
**File Upload:** Multer + Cloudinary para galería
**Última actualización:** 2026-06-01
