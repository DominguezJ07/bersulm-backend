## WHAT
Backend REST API para BERSULM — app de barbería premium.
Stack: Node.js 20, Express 5, MongoDB con Mongoose, JWT + bcrypt.
Arquitectura: Hexagonal (Ports & Adapters).
9 colecciones: users, services, appointments, blocked_slots, gallery, rewards, raffles, reward_votes, loyalty_cards.

## WHY
App móvil para reservas, sorteos mensuales, tarjeta de fidelidad y galería de estilos. Dos roles: client y admin.

## HOW
- Cada dominio tiene carpetas: domain/ application/ infrastructure/
- Las clases de dominio NO importan nada de infraestructura
- Usar JSDoc en lugar de TypeScript
- Tests con Jest
- Nunca hacer commit directo a main
- Rutas base: /api/v1/
