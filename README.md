<<<<<<< HEAD
# 🍽️ DineSmart AI — Restaurant Booking with AI Recommendations

A full-stack production-quality MVP built with React + Vite + Tailwind CSS (frontend) and Node.js + Express + MongoDB (backend), featuring JWT auth and OpenAI-powered restaurant discovery.

---

## 📁 Project Structure

```
Dine/
├── client/          # React + Vite + Tailwind frontend
└── server/          # Node.js + Express + MongoDB backend
```

---

## ⚙️ Setup & Installation

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dinesmart
JWT_SECRET=your_super_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

Start the server:
```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

Server runs on: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`  
API calls are proxied to `http://localhost:5000` automatically via Vite proxy config.

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/restaurants` | ❌ | List restaurants (filter by cuisine/location/price) |
| GET | `/api/restaurants/:id` | ❌ | Get restaurant details |
| POST | `/api/restaurants` | 🔑 Admin | Add restaurant |
| DELETE | `/api/restaurants/:id` | 🔑 Admin | Delete restaurant |
| GET | `/api/tables/:restaurantId` | ✅ | Get tables for restaurant |
| GET | `/api/tables/available/:restaurantId` | ✅ | Get available tables (date+time+people) |
| POST | `/api/tables` | 🔑 Admin | Add table |
| POST | `/api/bookings` | ✅ | Create booking |
| GET | `/api/bookings/my` | ✅ | Get my bookings |
| GET | `/api/bookings/all` | 🔑 Admin | Get all bookings |
| PATCH | `/api/bookings/:id/cancel` | ✅ | Cancel booking |
| POST | `/api/ai/recommend` | ✅ | AI restaurant recommendations |

---

## 🧪 Quick Test Flow

1. Sign up as **admin** → add restaurants & tables in Admin Panel  
2. Sign up as **user** → use AI Chat or browse restaurants  
3. Click "Book a Table" → select date/time/people → check availability → confirm  
4. View & cancel in "My Bookings"

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `OPENAI_API_KEY` | OpenAI API key for AI recommendations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcrypt |
| AI | OpenAI GPT-3.5 Turbo |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
=======
# Dine-Smart
DineSmart is a multi-tenant restaurant management and booking ecosystem built for the city of Chennai. It serves three distinct user roles — customers, restaurant owners, and platform administrators each with a tailored interface and set of capabilities.
>>>>>>> 213776b929fc82d73faeb1b7b5995e9d802f9db7
