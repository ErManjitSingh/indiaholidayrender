# Backend Checklist (Developer ke liye)

## 1. jsonwebtoken installed

- **Status:** Done  
- **Where:** `package.json` → `"jsonwebtoken": "^9.0.3"`  
- **Check:** `npm list jsonwebtoken`

---

## 2. JWT_SECRET env me set

- **Status:** Set in `.env` (and on Render Environment Variables)  
- **Required:** `JWT_SECRET=your-super-secret-key` (production me strong random value use karein)  
- **Note:** Bina JWT_SECRET ke auth middleware "any token" accept karta hai (dev only).

---

## 3. POST /api/auth/login JWT return karta hai

- **Status:** Done  
- **Route:** `POST /api/auth/login`  
- **File:** `routes/authRoutes.js`  
- **Body:** `{ "email": "...", "password": "..." }`  
- **Response:** `{ success: true, token, user: { email, role: "admin" }, expiresIn: "7d" }`

---

## 4. Auth middleware JWT verify karta hai

- **Status:** Done  
- **File:** `middleware/auth.js`  
- **Logic:** Jab `JWT_SECRET` set ho → `jwt.verify(token, secret)` use hota hai; invalid/expired pe 401.  
- **Header:** `Authorization: Bearer <token>` ya `X-Admin-Token: <token>`

---

## 5. Treks / Packages routes protected hain

- **Status:** Done  
- **File:** `routes/trekRoutes.js`  

| Route / Action              | Protected? | Notes                    |
|----------------------------|-----------|--------------------------|
| GET /api/treks             | No        | Public list              |
| GET /api/treks/:id         | No        | Public single trek       |
| POST /api/treks            | Yes       | `authenticateAdmin`      |
| PUT /api/treks/:id         | Yes       | `authenticateAdmin`      |
| DELETE /api/treks/:id      | Yes       | `authenticateAdmin`      |
| PATCH /api/treks/:id/section | Yes     | `authenticateAdmin`      |
| POST /api/treks/bulk-update | Yes      | `authenticateAdmin`      |
| GET /api/treks/:id/schema-preview | Yes | `authenticateAdmin` |
| GET /api/treks/:id/seo-report | Yes    | `authenticateAdmin`      |

- **GA4 routes:** Saari `/api/ga4/*` bhi `authenticateAdmin` se protected hain.

---

## 6. Middleware order sahi hai

- **Status:** Done  
- **File:** `index.js`  

Order:

1. `cors()` – CORS pehle  
2. `express.json()` – body parse (login ke liye zaroori)  
3. `express.urlencoded({ extended: true })`  
4. Request logging (optional)  
5. Routes:  
   - Public: `GET /`, `POST /api/auth/login`, `GET /api/treks`, `GET /api/treks/:id`  
   - Protected: `/api/ga4/*`, treks mutate routes – in par `authenticateAdmin` route-level lagta hai  

Body parsers routes se pehle hain, isliye `POST /api/auth/login` ko `req.body` sahi milega.

---

## Quick test

```bash
# 1. Login – JWT lo
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"manjitsingh012345@gmail.com\",\"password\":\"Anku_123!\"}"

# 2. Token use karke protected route
curl -H "Authorization: Bearer <PASTE_TOKEN_HERE>" http://localhost:3000/api/ga4/health
curl -H "Authorization: Bearer <PASTE_TOKEN_HERE>" -X POST http://localhost:3000/api/treks -H "Content-Type: application/json" -d "{}"
```
