# Bitell — AI-Powered Business Financial Intelligence

> Turn your bank statements into clear business insights in minutes.

---

## What's New in v3 (Phase 2)

| Change | Details |
|---|---|
| **Renamed FinTrack → Bitell** | All branding, tokens, emails, UI |
| **Currency auto-detection** | Gemini detects NGN, USD, GBP, EUR, GHS, KES, ZAR from statement |
| **Monthly breakdown view** | Click any month → see KPIs + % change vs previous month + narrative |
| **Transaction Categories** | Renamed from "Unique Categories" — clearer, more relatable |
| **Practical recommendations** | Specific, action-oriented guidance. Loss = concrete steps, not benchmarks |
| **Upload retry logic** | Gemini service retries up to 3× with backoff on transient errors |
| **Expanded category list** | 14 expense + 7 income categories covering more business types |
| **Redesigned UI** | Inter/JetBrains Mono fonts, glass-card system, refined dark theme |

---

## File Structure

```
bitell/
├── backend/
│   ├── server.js                   ← Entry: MongoDB + routes
│   ├── package.json
│   ├── .env.example
│   ├── models/
│   │   ├── User.js                 ← Trial/subscription/access logic
│   │   └── Statement.js            ← Currency fields added
│   ├── controllers/
│   │   ├── auth.controller.js      ← register/login/forgot/reset
│   │   ├── upload.controller.js    ← AI pipeline + currency + recommendations
│   │   └── stats.controller.js     ← Live counter for landing page
│   ├── middleware/
│   │   ├── auth.middleware.js      ← JWT protect + requireFullAccess
│   │   ├── upload.middleware.js    ← Multer config
│   │   └── error.middleware.js     ← Global handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── upload.routes.js
│   │   └── stats.routes.js
│   └── utils/
│       ├── db.js                   ← Mongoose connection
│       ├── email.js                ← Bitell branded emails
│       ├── gemini.service.js       ← Currency detection + 3× retry
│       └── fileParser.js           ← PDF + CSV extraction
│
└── frontend/
    └── src/
        ├── App.jsx                 ← React Router
        ├── context/AuthContext.jsx ← Global auth (bitell_token)
        ├── pages/
        │   ├── LandingPage.jsx     ← Marketing + live counter
        │   ├── UploadPage.jsx
        │   ├── DashboardPage.jsx   ← Currency-aware, monthly breakdown
        │   ├── SubscribePage.jsx
        │   └── auth/               ← Login, Register, Forgot, Reset
        ├── components/
        │   ├── auth/               ← AuthLayout, AuthInput, ProtectedRoute
        │   ├── dashboard/          ← Header, KpiCard, RecommendationPanel, TransactionsTable
        │   ├── charts/             ← MonthlyTrendChart (currency-aware)
        │   ├── monthly/            ← MonthlyBreakdown (NEW — per-month selector)
        │   └── upload/             ← FileUpload
        ├── hooks/useUpload.js
        └── utils/
            ├── api.js              ← Axios + bitell_token interceptor
            └── formatters.js       ← Currency-aware formatters
```

---

## Setup (3 minutes)

### Step 1 — MongoDB Atlas
1. Go to **https://cloud.mongodb.com** → Create free M0 cluster
2. Database Access → Add user
3. Network Access → Allow `0.0.0.0/0`
4. Connect → Copy connection string

### Step 2 — Gemini API Key
Go to **https://aistudio.google.com/app/apikey** → Create API key

### Step 3 — Backend .env
```bash
cd bitell/backend
cp .env.example .env
# Fill in: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, EMAIL_* vars
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4 — Install & run backend
```bash
cd bitell/backend
npm install
npm run dev
# → ✅ MongoDB connected
# → 🚀 Bitell API v3 running at http://localhost:5000
```

### Step 5 — Install & run frontend
```bash
cd bitell/frontend
npm install
npm run dev
# → ➜ http://localhost:5173
```

Open **http://localhost:5173** — you'll see the Bitell landing page.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/register` | None | Create account + JWT |
| POST | `/api/auth/login` | None | Login + JWT |
| GET | `/api/auth/me` | JWT | Current user profile |
| POST | `/api/auth/forgot-password` | None | Send reset email |
| POST | `/api/auth/reset-password` | None | Reset with token |
| POST | `/api/upload` | JWT | Upload + AI analyse |
| GET | `/api/upload/history` | JWT | Past statements |
| GET | `/api/upload/:id` | JWT | Single statement |
| GET | `/api/stats/public` | None | Live statement count |

---

## Currency Support

Bitell auto-detects currency from the statement content:

| Symbol | Currency |
|---|---|
| ₦ / NGN | Nigerian Naira |
| $ / USD | US Dollar |
| £ / GBP | British Pound |
| € / EUR | Euro |
| ₵ / GHS | Ghanaian Cedi |
| KSh / KES | Kenyan Shilling |
| R / ZAR | South African Rand |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Upload fails on first try | Retry — Gemini service now retries 3× automatically |
| Wrong currency shown | Ensure statement has clear currency symbols/codes |
| `MongoServerError: bad auth` | Check MONGODB_URI credentials |
| Password reset email not arriving | Use Gmail App Password, check spam folder |
| `Cannot find module` | Run `npm install` in the correct folder |