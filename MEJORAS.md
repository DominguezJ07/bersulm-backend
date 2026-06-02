# Plan de Mejora — Bersulm Backend

Basado en las skills: `nodejs-backend-patterns`, `nodejs-best-practices`, `nodejs-express-server`.

---

## 🔴 SEGURIDAD (4 tareas)

### 1. Agregar authMiddleware + adminMiddleware a rutas faltantes
- **Archivos:** `service.routes.js`, `appointment.routes.js`, `gallery.routes.js`, `loyalty.routes.js`
- **Acción:** Aplicar `authMiddleware` + `adminMiddleware` en rutas POST/PUT/DELETE de admin. Aplicar `authMiddleware` en rutas que usan `req.user`.
- **Skill:** `nodejs-express-server` — Middleware Chain Implementation

### 2. Fix auth bypass en AppointmentController
- **Archivo:** `AppointmentController.js`
- **Problema:** `const userId = req.user?.id || req.body.userId` permite impersonar usuarios
- **Acción:** Forzar `req.user.id` siempre que el endpoint requiera autenticación
- **Skill:** `nodejs-best-practices` — Security Mindset ("Trust nothing")

### 3. Proteger endpoint debug /test-month-end
- **Archivo:** `raffle.routes.js`
- **Acción:** Envolver en `if (env.NODE_ENV !== 'production')` o eliminar
- **Skill:** `nodejs-best-practices` — Security Checklist

### 4. Implementar POST /auth/refresh-token
- **Archivos:** `AuthController.js`, `auth.routes.js`, `LoginUseCase.js`
- **Acción:** Endpoint que recibe refresh token, lo verifica y devuelve un nuevo access token + refresh token
- **Skill:** `nodejs-backend-patterns` — Authentication & Authorization

---

## 🟡 ARQUITECTURA HEXAGONAL (5 tareas)

### 5. Unificar DomainError en src/shared/domain/
- **Acción:** Crear `src/shared/domain/DomainError.js` con clase base y errores comunes. Eliminar definiciones duplicadas en `GalleryErrors.js`, `LoyaltyErrors.js`, `RaffleErrors.js`, `RewardErrors.js`. Actualizar imports en `ServiceErrors.js` y `AppointmentErrors.js`.
- **Skill:** `nodejs-backend-patterns` — Error Handling (Custom Error Classes)

### 6. Refactorizar RaffleController para usar use cases
- **Archivo:** `RaffleController.js`
- **Problema:** Usa `RaffleModel` y `RewardVoteModel` directamente en vez de los use cases
- **Acción:** Delegar en `GetCurrentRaffleUseCase`, `VoteForRewardUseCase`, `GetVotesUseCase`
- **Skill:** `nodejs-backend-patterns` — Layered Architecture

### 7. Inyectar JwtService vía interfaz en LoginUseCase
- **Archivo:** `LoginUseCase.js`
- **Problema:** Importa `JwtService` directamente desde infraestructura
- **Acción:** Definir interfaz/abstract class `ITokenService` en domain, inyectar en constructor
- **Skill:** `nodejs-backend-patterns` — Dependency Injection

### 8. Usar BcryptService compartido en RegisterUseCase y seed
- **Archivos:** `RegisterUseCase.js`, `seed.js`
- **Problema:** Usan `bcrypt` directo con salt 10, mientras `BcryptService` usa salt 12
- **Acción:** Inyectar `BcryptService` en `RegisterUseCase` y usarlo en seed
- **Skill:** `nodejs-backend-patterns` — Service Layer

### 9. Conectar LoyaltyService real en AppointmentController
- **Archivo:** `AppointmentController.js`
- **Problema:** Pasa `null` como `loyaltyService`, la fidelidad nunca se actualiza
- **Acción:** Inyectar `MongoLoyaltyRepository` + `AddVisitUseCase` / `CancelAppointmentUseCase`
- **Skill:** `nodejs-backend-patterns` — Dependency Injection

---

## 🟢 CALIDAD DE CÓDIGO (4 tareas)

### 10. Eliminar console.log artifacts
- **Archivos:** `auth.middleware.js`, `admin.middleware.js`, `RaffleController.js`, `raffle.routes.js`
- **Acción:** Remover todos los `console.log` de debugging
- **Skill:** `nodejs-best-practices` — Production Readiness

### 11. Crear ApiResponse helper y unificar formato
- **Archivo nuevo:** `src/shared/domain/ApiResponse.js`
- **Acción:** Helper con métodos estáticos `success()`, `error()`, `paginated()`. Refactorizar todos los controllers para usarlo.
- **Skill:** `nodejs-backend-patterns` — API Response Format

### 12. Estandarizar status codes en delete
- **Acción:** Todos los DELETE deben retornar 204 sin body (consistente con HTTP semantics)
- **Skill:** `nodejs-best-practices` — Status Code Selection

### 13. Unificar _generateSlots() duplicado
- **Archivos:** `GetAvailableSlotsUseCase.js`, `MongoAppointmentRepository.js`
- **Acción:** Mover lógica al repository o a un helper compartido
- **Skill:** `nodejs-best-practices` — Architecture Principles (DRY)

---

## 🔵 MEJORAS GENERALES (5 tareas)

### 14. Agregar rate limiting
- **Dependencia:** `express-rate-limit` (instalar)
- **Acción:** `apiLimiter` global (100 req/15min) + `authLimiter` estricto (5 req/15min) en login
- **Skill:** `nodejs-backend-patterns` — Rate Limiting Middleware

### 15. Agregar input validation con express-validator
- **Dependencia:** Ya instalado (`express-validator`)
- **Acción:** Crear schemas de validación para cada endpoint y aplicar como middleware
- **Skill:** `nodejs-backend-patterns` — Validation Middleware

### 16. Reemplazar morgan por Pino (structured logging)
- **Dependencia:** `pino` + `pino-http` (instalar)
- **Acción:** Reemplazar `morgan('dev')` por `pino-http` en `app.js`. Usar `pino` en lugar de `console.log` en `server.js`
- **Skill:** `nodejs-backend-patterns` — Request Logging Middleware

### 17. Configurar CORS con ALLOWED_ORIGINS desde env
- **Archivos:** `app.js`, `env.js`
- **Acción:** Agregar `ALLOWED_ORIGINS` a env, usar `cors({ origin: env.ALLOWED_ORIGINS?.split(',') })`
- **Skill:** `nodejs-express-server` — Environment Configuration

### 18. Agregar npm scripts y tests iniciales
- **Archivo:** `package.json`
- **Acción:** Agregar scripts `dev`, `start`, `test`. Escribir test unitario para un use case y test de integración para un endpoint
- **Skill:** `nodejs-best-practices` — Testing Strategy

---

**Progreso:** 0/18 completado
**Última actualización:** 2026-06-01
