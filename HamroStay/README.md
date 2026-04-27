# 🏨 HamroStay — Luxury Hotel Management System

> Full-stack MERN hotel management system with AI chat, payments, vendor management, FNMIS, and role-based access control.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Zustand, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas via Prisma ORM |
| Auth | JWT + Refresh Tokens, bcrypt |
| Payments | Stripe (checkout + webhooks) |
| AI Chat | Groq SDK (LLaMA 3) |
| Maps | Leaflet.js + OpenStreetMap |
| Images | UploadThing |
| Caching | node-cache (in-memory) + HTTP cache headers |
| Real-time | Socket.IO (chat + notifications) |
| Email | Nodemailer |

---

## 📁 Project Structure

```
hamrostay/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                     # Axios instances & API calls
│   │   │   ├── axiosInstance.js
│   │   │   ├── authApi.js
│   │   │   ├── roomApi.js
│   │   │   ├── bookingApi.js
│   │   │   ├── paymentApi.js
│   │   │   ├── vendorApi.js
│   │   │   └── fnmisApi.js
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── rooms/
│   │   │   │   ├── RoomCard.jsx
│   │   │   │   ├── RoomGallery.jsx
│   │   │   │   └── RoomFilter.jsx
│   │   │   ├── booking/
│   │   │   │   ├── BookingForm.jsx
│   │   │   │   ├── BookingCard.jsx
│   │   │   │   └── DatePicker.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   └── ChatBubble.jsx
│   │   │   ├── maps/
│   │   │   │   └── HotelMap.jsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCard.jsx
│   │   │       ├── RevenueChart.jsx
│   │   │       └── OccupancyChart.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── RoomsPage.jsx
│   │   │   │   ├── RoomDetailPage.jsx
│   │   │   │   ├── AboutPage.jsx
│   │   │   │   └── ContactPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboard.jsx
│   │   │   │   ├── MyBookings.jsx
│   │   │   │   ├── BookingDetail.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ManageRooms.jsx
│   │   │   │   ├── ManageBookings.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   ├── ManageVendors.jsx
│   │   │   │   └── FnmisDashboard.jsx
│   │   │   └── vendor/
│   │   │       ├── VendorDashboard.jsx
│   │   │       ├── VendorOrders.jsx
│   │   │       └── VendorInventory.jsx
│   │   ├── store/                   # Zustand global state
│   │   │   ├── authStore.js
│   │   │   ├── bookingStore.js
│   │   │   └── chatStore.js
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useDebounce.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                          # Express backend
    ├── prisma/
    │   └── schema.prisma            # Prisma + MongoDB schema
    ├── src/
    │   ├── config/
    │   │   ├── db.js                # Prisma client singleton
    │   │   ├── stripe.js
    │   │   ├── groq.js
    │   │   ├── uploadthing.js
    │   │   └── socket.js
    │   ├── middleware/
    │   │   ├── auth.middleware.js   # JWT verify
    │   │   ├── role.middleware.js   # RBAC guard
    │   │   ├── cache.middleware.js  # Response caching
    │   │   ├── rateLimit.middleware.js
    │   │   └── error.middleware.js
    │   ├── modules/
    │   │   ├── auth/
    │   │   │   ├── auth.routes.js
    │   │   │   ├── auth.controller.js
    │   │   │   └── auth.service.js
    │   │   ├── rooms/
    │   │   │   ├── room.routes.js
    │   │   │   ├── room.controller.js
    │   │   │   └── room.service.js
    │   │   ├── bookings/
    │   │   │   ├── booking.routes.js
    │   │   │   ├── booking.controller.js
    │   │   │   └── booking.service.js
    │   │   ├── payments/
    │   │   │   ├── payment.routes.js
    │   │   │   ├── payment.controller.js
    │   │   │   └── payment.service.js
    │   │   ├── chat/
    │   │   │   ├── chat.routes.js
    │   │   │   ├── chat.controller.js
    │   │   │   └── chat.service.js
    │   │   ├── vendors/
    │   │   │   ├── vendor.routes.js
    │   │   │   ├── vendor.controller.js
    │   │   │   └── vendor.service.js
    │   │   ├── fnmis/
    │   │   │   ├── fnmis.routes.js
    │   │   │   ├── fnmis.controller.js
    │   │   │   └── fnmis.service.js
    │   │   └── users/
    │   │       ├── user.routes.js
    │   │       ├── user.controller.js
    │   │       └── user.service.js
    │   ├── utils/
    │   │   ├── apiResponse.js
    │   │   ├── asyncHandler.js
    │   │   ├── cache.js
    │   │   ├── email.js
    │   │   └── generateToken.js
    │   └── app.js
    ├── .env.example
    ├── server.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Environment Setup

Copy `server/.env.example` to `server/.env` and fill in your keys.

### 3. Setup Prisma

```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Run Development

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## 🔐 Roles & Permissions

| Feature | Admin | Customer | Vendor |
|---------|-------|----------|--------|
| Manage Rooms | ✅ | ❌ | ❌ |
| Book Rooms | ✅ | ✅ | ❌ |
| View Own Bookings | ✅ | ✅ | ❌ |
| Manage All Bookings | ✅ | ❌ | ❌ |
| FNMIS Dashboard | ✅ | ❌ | ❌ |
| Manage Vendors | ✅ | ❌ | ❌ |
| Vendor Dashboard | ❌ | ❌ | ✅ |
| AI Chat | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET  /api/auth/me`

### Rooms
- `GET    /api/rooms` — list with filters/pagination
- `GET    /api/rooms/:id`
- `POST   /api/rooms` — Admin only
- `PUT    /api/rooms/:id` — Admin only
- `DELETE /api/rooms/:id` — Admin only

### Bookings
- `GET  /api/bookings` — Admin: all | Customer: own
- `GET  /api/bookings/:id`
- `POST /api/bookings`
- `PUT  /api/bookings/:id/status` — Admin only
- `DELETE /api/bookings/:id`

### Payments
- `POST /api/payments/create-session`
- `POST /api/payments/webhook`
- `GET  /api/payments/history`

### Chat
- `POST /api/chat/message`
- `GET  /api/chat/history`

### Vendors
- `GET    /api/vendors`
- `POST   /api/vendors`
- `PUT    /api/vendors/:id`
- `GET    /api/vendors/:id/orders`
- `POST   /api/vendors/:id/orders`

### FNMIS
- `GET /api/fnmis/revenue`
- `GET /api/fnmis/occupancy`
- `GET /api/fnmis/expenses`
- `GET /api/fnmis/reports`
- `POST /api/fnmis/expenses`

---

## ⚡ Performance Strategies

1. **In-memory caching** — Room listings cached for 5 min, busted on mutation
2. **Prisma query optimization** — Select only needed fields, avoid N+1 with `include`
3. **Rate limiting** — 100 req/15min per IP
4. **Pagination** — All list endpoints cursor/offset paginated
5. **Image optimization** — UploadThing handles CDN + compression
6. **React Query** — Client-side cache + background refetch
7. **Code splitting** — Vite lazy loads route pages
8. **Socket.IO** — Real-time chat without polling

---

## 📊 FNMIS (Financial & Management Information System)

- Revenue tracking by day/week/month/year
- Occupancy rate analytics
- Expense management (vendor orders, utilities, maintenance)
- Profit & loss report generation
- Export to CSV
- Real-time KPI cards

---

*Built with ❤️ for HamroStay Luxury Hotels*
