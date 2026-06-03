# Frontend — Minijuego de Fidelidad (Guía de Implementación)

---

## 1. Endpoints (Backend)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/loyalty` | Token cliente | Tarjeta propia (admin retorna `null`) |
| `GET` | `/api/v1/loyalty/user/:id` | Token admin | Tarjeta de cualquier usuario por ID |
| `GET` | `/api/v1/loyalty/minigame` | Token cliente | Iniciar/ver minijuego propio |
| `POST` | `/api/v1/loyalty/minigame/reveal` | Token cliente | Revelar carta del minijuego |
| `POST` | `/api/v1/loyalty/visit` | Token admin | Agregar visita a un usuario |
| `GET` | `/api/v1/auth/users/search?q=...` | Token admin | Buscar usuarios por nombre/email/teléfono |
npm
---

## 2. Respuestas de cada endpoint

### 2.1 GET /loyalty (tarjeta propia)

**Cliente:**
```json
{
  "success": true,
  "data": {
    "_id": "664a...",
    "userId": "663b...",
    "visits": 3,
    "totalVisits": 15,
    "status": "active",
    "currentCycle": 3,
    "rewardId": null,
    "rewardWon": null,
    "minigameCards": null
  }
}
```

**Admin:**
```json
{
  "success": true,
  "data": null
}
```

### 2.2 GET /loyalty/user/:id (admin ve tarjeta de otro)

```
GET /api/v1/loyalty/user/663b123...
Headers: Authorization: Bearer <token_admin>
```

```json
{
  "success": true,
  "data": {
    "_id": "664a...",
    "userId": "663b123...",
    "visits": 4,
    "totalVisits": 19,
    "status": "active",
    "currentCycle": 4,
    "rewardId": null,
    "rewardWon": "Bebida Gratis"
  }
}
```

Si el usuario no tiene tarjeta:
```json
{
  "success": false,
  "message": "User has no loyalty card"
}
```
HTTP 404

### 2.3 POST /loyalty/visit (admin agrega visita)

```
POST /api/v1/loyalty/visit
Headers: Authorization: Bearer <token_admin>
Content-Type: application/json

{ "userId": "663b123..." }
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "664a...",
    "userId": "663b123...",
    "visits": 5,
    "totalVisits": 20,
    "status": "reward_pending",
    "currentCycle": 4,
    "rewardId": null,
    "rewardWon": null
  }
}
```

### 2.4 GET /loyalty/minigame (iniciar minijuego)

```
GET /api/v1/loyalty/minigame
Headers: Authorization: Bearer <token_cliente>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "cardsCount": 10,
    "availableRewards": [
      { "rewardId": "665c...", "name": "Bebida Gratis" }
    ]
  }
}
```

> Si el minijuego ya se inició antes y el usuario no ha revelado, devuelve el mismo estado (no regenera cartas).
> Si `status !== 'reward_pending'`, devuelve error 400.

### 2.5 POST /loyalty/minigame/reveal (revelar carta)

```
POST /api/v1/loyalty/minigame/reveal
Headers: Authorization: Bearer <token_cliente>
Content-Type: application/json

{ "cardIndex": 3 }
```

**Ganó:**
```json
{
  "success": true,
  "data": {
    "won": true,
    "reward": { "id": "665c...", "name": "Bebida Gratis" },
    "cardStatus": "reward_claimed",
    "currentCycle": 5
  }
}
```

**Perdió:**
```json
{
  "success": true,
  "data": {
    "won": false,
    "reward": null,
    "cardStatus": "active",
    "currentCycle": 5
  }
}
```

**Errores:**
| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `cardIndex must be an integer between 0 and 9` | Validación |
| 400 | `Minigame not started` | No llamó a /minigame antes |
| 409 | `This card has already been revealed` | Ya tocó esa carta |
| 400 | `No hay premio pendiente` | Status != reward_pending |

### 2.6 GET /auth/users/search?q=... (admin busca usuarios)

```
GET /api/v1/auth/users/search?q=julian
Headers: Authorization: Bearer <token_admin>
```

```json
{
  "success": true,
  "data": [
    {
      "id": "663b123...",
      "name": "Julian Dominguez",
      "email": "julian@bersulm.com",
      "phone": "3001234568",
      "role": "client"
    }
  ]
}
```

---

## 3. Pantallas

### 3.1 Pantalla de Fidelidad (cliente)

Dos estados: progreso normal o premio pendiente.

**Estado normal (visits < 5):**
```
┌─────────────────────────────────┐
│     🏆 Tarjeta de Fidelidad     │
│                                 │
│   Visitas: ◉ ◉ ◉ ◉ ○  (4/5)   │
│   Ciclo actual: 3              │
│   Total visitas: 14            │
└─────────────────────────────────┘
```

**Estado reward_pending (visits >= 5):**
```
┌─────────────────────────────────┐
│     🏆 Tarjeta de Fidelidad     │
│                                 │
│   Visitas: ◉ ◉ ◉ ◉ ◉  (5/5)   │
│                                 │
│   ┌──────────────────────────┐  │
│   │  🎁 ¡Tienes un regalo    │  │
│   │    por tu fidelidad!     │  │
│   │    [  JUGAR AHORA  ]     │  │
│   └──────────────────────────┘  │
└─────────────────────────────────┘
```

**Lógica:**
```js
const user = useAuth(); // { id, email, role }
const isAdmin = user.role === 'admin';

// ❌ INCORRECTO (muestra tarjeta a admin)
if (card) { ... }

// ✅ CORRECTO (admin NUNCA ve tarjeta propia)
if (!isAdmin && card) {
  if (card.status === 'reward_pending') {
    showRewardBanner();
  } else {
    showVisitProgress(card.visits, 5);
  }
}
```

### 3.2 Panel Admin de Fidelidad

El panel admin **siempre es visible** para admins. No depende de tener `card` (admin no tiene tarjeta). Funciona con el usuario buscado.

```
┌─────────────────────────────────────────────┐
│  🔍 Panel Admin — Fidelidad                 │
│                                             │
│  [_____Buscar usuario...________] [Buscar]  │
│                                             │
│  ── Resultados ───────────────────────────  │
│  ┌───────────────────────────────────────┐  │
│  │ Julian Dominguez                      │  │
│  │ julian@bersulm.com · 3001234568      │  │
│  │ [  Ver Tarjeta  ]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ── Tarjeta del usuario ────────────────    │
│  ┌───────────────────────────────────────┐  │
│  │ Visitas: ◉ ◉ ◉ ◉ ○  (4/5)          │  │
│  │ Ciclo: 3 · Total: 14                 │  │
│  │ Estado: active                       │  │
│  │ Último premio: Bebida Gratis         │  │
│  │                                       │  │
│  │ [  Agregar Visita +1  ]              │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Flujo admin:**
```
1. Admin busca usuario → GET /auth/users/search?q=...
2. Selecciona un usuario → guarda selectedUser
3. Ve su tarjeta → GET /loyalty/user/{selectedUser.id}
4. Agrega visita → POST /loyalty/visit { userId: selectedUser.id }
5. Refresca tarjeta → vuelve a GET /loyalty/user/{selectedUser.id}
```

**Pseudocódigo:**
```js
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [userCard, setUserCard] = useState(null);

// Buscar usuarios
async function searchUsers() {
  const res = await api.get(`/auth/users/search?q=${searchQuery}`);
  setSearchResults(res.data.data);
}

// Seleccionar usuario y cargar su tarjeta
async function selectUser(user) {
  setSelectedUser(user);
  const res = await api.get(`/loyalty/user/${user.id}`);
  setUserCard(res.data.data);
}

// Agregar visita
async function addVisit() {
  const res = await api.post('/loyalty/visit', { userId: selectedUser.id });
  setUserCard(res.data.data);
}

// Renderizado
if (isAdmin) {
  return (
    <AdminPanel>
      <SearchBar onSearch={searchUsers} />
      <SearchResults users={searchResults} onSelect={selectUser} />
      {selectedUser && userCard && (
        <UserCardDetail card={userCard} onAddVisit={addVisit} />
      )}
      {selectedUser && !userCard && (
        <p>Este usuario no tiene tarjeta de fidelidad</p>
      )}
    </AdminPanel>
  );
}
```

### 3.3 Pantalla del Minijuego (cliente)

```
┌─────────────────────────────────┐
│     🎁 Minijuego de Fidelidad   │
│                                 │
│   Posible premio: Bebida Gratis │
│                                 │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│   │ ? │ │ ? │ │ ? │ │ ? │     │
│   └───┘ └───┘ └───┘ └───┘     │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│   │ ? │ │ ? │ │ ? │ │ ? │     │
│   └───┘ └───┘ └───┘ └───┘     │
│   ┌───┐ ┌───┐                   │
│   │ ? │ │ ? │                   │
│   └───┘ └───┘                   │
│                                 │
│   Toca una carta para revelar   │
└─────────────────────────────────┘
```

**Pseudocódigo:**
```js
const [cards, setCards] = useState([]);
const [possibleReward, setPossibleReward] = useState('');
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);

// Al entrar a la pantalla
useEffect(() => {
  api.get('/loyalty/minigame').then(res => {
    const { availableRewards } = res.data.data;
    setPossibleReward(availableRewards[0]?.name || 'premio sorpresa');
    // Crear 10 cartas volteadas
    setCards(Array.from({ length: 10 }, (_, i) => ({
      index: i,
      revealed: false,
      isWinner: false
    })));
  });
}, []);

// Al tocar una carta
async function revealCard(cardIndex) {
  if (loading || cards[cardIndex].revealed) return;
  setLoading(true);
  
  try {
    const res = await api.post('/loyalty/minigame/reveal', { cardIndex });
    const data = res.data.data;
    
    // Actualizar la carta revelada
    const newCards = [...cards];
    newCards[cardIndex] = { ...newCards[cardIndex], revealed: true, isWinner: data.won };
    setCards(newCards);
    
    // Animación de volteo (0.5s)
    await delay(500);
    
    // Mostrar resultado
    setResult(data);
  } catch (err) {
    alert(err.response?.data?.message || 'Error al revelar carta');
  } finally {
    setLoading(false);
  }
}
```

**Resultado (ganó):**
```
┌─────────────────────────────────┐
│         🎉 ¡GANASTE! 🎉         │
│                                 │
│         🎁 Bebida Gratis        │
│                                 │
│   ¡Disfruta tu premio en tu     │
│       próxima visita!           │
│                                 │
│        [  Volver  ]             │
└─────────────────────────────────┘
```

**Resultado (perdió):**
```
┌─────────────────────────────────┐
│                                 │
│   😔 ¡Sigue participando!       │
│                                 │
│   Completa 5 visitas más para   │
│   intentarlo de nuevo.          │
│                                 │
│        [  Volver  ]             │
└─────────────────────────────────┘
```

---

## 4. Flujo completo

### Flujo cliente
```
App abre → GET /loyalty
    │
    ├── data: null (es admin) → no mostrar sección fidelidad
    │
    └── data: { status, visits }
        │
        ├── status = 'active', visits < 5 → progreso normal
        │
        ├── status = 'reward_pending' → mostrar botón "Jugar"
        │       │
        │       ▼ usuario toca el botón
        │   GET /loyalty/minigame → 10 cartas volteadas
        │       │
        │       ▼ usuario toca una carta
        │   POST /loyalty/minigame/reveal { cardIndex }
        │       │
        │       ├── won: true  → celebración + mostrar premio
        │       └── won: false → mensaje "sigue participando"
        │
        └── status = 'reward_claimed' → mostrar último premio ganado
                (card.rewardWon tiene el nombre)
```

### Flujo admin
```
Admin Panel → siempre visible (isAdmin === true)

    1. Buscar usuario:
       GET /auth/users/search?q=julian
       → lista de resultados

    2. Seleccionar usuario:
       GET /loyalty/user/{id}
       → tarjeta del usuario (visits, status, ciclo, premios)

    3. Agregar visita:
       POST /loyalty/visit { userId }
       → tarjeta actualizada (visits++, status puede cambiar)

    4. Refrescar:
       GET /loyalty/user/{id}
       → ver cambios
```

---

## 5. Resumen de cambios frontend

| # | Archivo/Pantalla | Cambio |
|---|-----------------|--------|
| 1 | Pantalla Fidelidad | Condición `!isAdmin && card` en vez de `card` |
| 2 | Pantalla Fidelidad | Si `status === 'reward_pending'`, mostrar botón "Jugar Ahora" |
| 3 | Pantalla Fidelidad | Si `status === 'reward_claimed'`, mostrar `card.rewardWon` |
| 4 | Nueva: Pantalla Minijuego | Grid 10 cartas, animación flip, resultado |
| 5 | Panel Admin | Siempre visible si `isAdmin`, no depende de `card` |
| 6 | Panel Admin | Barra de búsqueda → `GET /auth/users/search?q=...` |
| 7 | Panel Admin | Al seleccionar usuario → `GET /loyalty/user/:id` |
| 8 | Panel Admin | Botón "Agregar Visita" → `POST /loyalty/visit { userId }` |
| 9 | Panel Admin | Refrescar tarjeta después de agregar visita |

---

## 6. Socket.io (opcional)

Escuchar evento `loyalty:updated` para refrescar en tiempo real:

```js
socket.on('loyalty:updated', (data) => {
  // data = { won, reward, cardStatus, currentCycle }
  // Si el admin agregó una visita, la tarjeta se actualiza
  refreshCard();
});
```
