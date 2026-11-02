<<<<<<< HEAD
# MenuQR — Full-Stack Restaurant Digital QR Menu SaaS

**MenuQR** is a production-quality, multi-tenant digital restaurant menu and contactless table-ordering SaaS platform.

It empowers restaurant owners to build and manage digital menus, generate unique table-identifying QR codes, receive orders in real time via WebSockets, and track scan and sales analytics. Customers enjoy an ultra-fast, mobile-first experience without needing an app download or account.

---

## 🌟 Key Features

### 1. Restaurant Owner Experience
- **Interactive Overview Dashboard**: Total contactless scans, order volume, daily/weekly revenue trends, active dishes, and popular selling dishes.
- **Menu Management**: Add, edit, delete dishes, set prices, assign categories, toggle veg/non-veg, spicy levels (1-3), bestsellers, new item badges, and preparation times.
- **Instant Availability Control**: 86 (sold out) or restock dishes in 1 click; updates diner menus instantly.
- **Category Hierarchy**: Create, edit, reorder (up/down), and manage category display priorities.
- **Dining Tables & Dynamic QR Codes**: Generate unique QR codes for each table (`/menu/:slug?table=T-01`). Download high-resolution PNGs, vector SVGs, and print ready-to-fold tabletop tent cards.
- **Live Kitchen Display (KOT Stream)**: Real-time incoming order stream powered by Socket.IO with audio chimes and interactive pipeline statuses (`Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Completed` / `Cancelled`).
- **Interactive Analytics**: Historical 7-day and 30-day graphs using Recharts, conversion rate analysis, daily revenue trends, and order status distribution.
- **Customizable Restaurant Settings**: Custom currency symbols (`$`, `₹`, `€`, `£`, `AED`, etc.), tax rate, service charge, opening hours, announcements, logo, and cover photo.

### 2. Diner / Customer Experience
- **Zero App Download**: Point any iPhone or Android camera at the table QR code to open the digital menu immediately.
- **Automatic Table Detection**: Table query parameters (`?table=T-01`) are automatically detected and pinned to the cart.
- **Dietary & Search Filters**: Instant client-side search, smooth-scrolling category navigation, Veg-only filter, and Bestseller filter.
- **Interactive Dish Modal**: High-res food photography, detailed ingredients, and special kitchen instruction notes.
- **Digital Cart & Checkout**: Add dishes, change quantities, add diner notes, calculate taxes, and submit order with cash / pay-at-counter payment.
- **Live Order Tracking**: Dynamic step-by-step order progress timeline (`Cooking`, `Ready for Table`, etc.) synced via Socket.IO.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, Socket.IO, JWT, bcryptjs, Multer, QRCode.
- **Database**: MongoDB with auto-starting embedded persistent engine fallback (`.mongo-data`) for instant zero-configuration local development, or any standard MongoDB Atlas / local URI via `MONGODB_URI`.

---

## 📁 Project Structure

```
anti/
├── package.json               # Root scripts (run client & server concurrently)
├── README.md                  # Complete documentation
├── server/
│   ├── package.json
│   ├── .env.example           # Environment variable template
│   ├── .env                   # Local configuration
│   ├── uploads/               # Uploaded images
│   ├── src/
│   │   ├── config/            # Database (connectDB) & Cloudinary
│   │   ├── models/            # User, Restaurant, Category, MenuItem, Table, Order, MenuAnalytics
│   │   ├── middleware/        # JWT auth, Restaurant tenant isolation, Multer upload, Error handler
│   │   ├── controllers/       # Auth, Restaurant, Category, MenuItem, Table, Order, Analytics
│   │   ├── routes/            # REST API route handlers
│   │   ├── socket/            # Socket.IO room subscriptions & broadcasting
│   │   ├── utils/             # QR Generator, seedData.js, testApi.js
│   │   └── server.js          # Express app, Socket.IO server, and SPA static hosting
└── client/
    ├── package.json
    ├── vite.config.js         # Vite proxy configuration for /api and /socket.io
    ├── tailwind.config.js     # Warm orange palette, typography, custom shadows
    ├── index.html             # Plus Jakarta Sans typography
    └── src/
        ├── api/               # Axios instance with auth interceptors
        ├── context/           # AuthContext, SocketContext, CartContext
        ├── components/
        │   ├── common/        # Navbar, Footer, Modal, Toast, LoadingSkeleton, Badges
        │   ├── dashboard/     # Sidebar, Topbar, PrintTableCard
        │   └── menu/          # RestaurantHeader, FoodCard, FoodDetailModal, CartDrawer
        ├── pages/
        │   ├── landing/       # Modern SaaS marketing homepage
        │   ├── auth/          # Login & Register with 1-click demo filler
        │   ├── setup/         # Restaurant setup wizard
        │   ├── dashboard/     # Overview, Menu, Categories, Orders, Tables, Analytics, Settings
        │   └── public/        # PublicMenuPage, OrderTrackingPage
        └── App.jsx            # React Router architecture
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Installation
Install all root, backend, and frontend packages:
```bash
# In the project root directory:
npm run install:all
```

### 3. Seed Demo Restaurant Data
Populate demo owner credentials, sample categories, 17 rich dishes, 6 tables with generated QR codes, and realistic order history:
```bash
npm run seed
```

### 4. Run the Development Server
Start both backend API (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Backend server (port 5000)
npm run server:dev

# Frontend client (port 5173)
npm run client:dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Restaurant Owner** | `owner@menuqr.com` | `password123` |

- **Owner Dashboard**: `http://localhost:5173/login` (Includes an **"Auto-fill Demo Credentials"** button for 1-click access).
- **Public Customer Menu Demo**: `http://localhost:5173/menu/royal-biryani?table=T-01`
- **Customer Order Tracking**: Dynamically created upon placing an order at `/order/:orderId`.

---

## ⚙️ Environment Variables

### `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/menuqr
JWT_SECRET=menuqr_super_secure_production_secret_key_2026_xyz
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Configuration (Local disk fallback is active if omitted)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔒 Security & Architecture

1. **Multi-Tenant Isolation**: Every Category, MenuItem, Table, Order, and Analytics entry belongs strictly to a `restaurant` ID. Requests to private endpoints pass through `requireRestaurant` middleware verifying ownership against the authenticated user's token.
2. **Password Security**: Passwords are never stored in plain text; salted and hashed via `bcryptjs` with 10 rounds.
3. **Price Integrity**: All order totals are computed server-side directly from MongoDB MenuItem prices at checkout time to prevent client-side price tampering.
4. **WebSocket Rooms**: Socket.IO channels are scoped (`restaurant_${id}` and `order_${id}`) so kitchen alerts and order updates are strictly routed to the authorized tenant and customer.

---

## 🧪 Testing

To run the automated backend test verifying database models, password hashing, categories, menu items, table QR codes, and order flow:
```bash
cd server
node src/utils/testApi.js
```
Expected output:
```
✓ Test 1 Passed: Demo user & bcrypt password hash verified.
✓ Test 2 Passed: Restaurant profile verified (The Royal Biryani & Bistro, slug: royal-biryani).
✓ Test 3 Passed: Found 5 categories and 17 menu items.
✓ Test 4 Passed: Verified 6 tables with high-res QR codes.
✓ Test 5 Passed: Verified 9 real order tickets.

========================================
🎉 ALL BACKEND FULL-STACK TESTS PASSED!
========================================
```

---

## 📄 License
MIT License. Built for modern restaurant hospitality.
=======
# menuqr
>>>>>>> 049dde24af2c10923e5e636bd7a37db34d3c24eb
