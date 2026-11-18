# Rentro Rentals - Commercial Two-Wheeler Rental Marketplace

A full-stack, responsive multi-page vehicle rental platform built with modern HTML5, CSS3, and ES6+ JavaScript. Rentro Rentals connects everyday commuters and tourists with verified vehicle fleet owners.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Dynamic City Discovery:** Browse transit hubs and major urban centers across India with real-time fleet availability counts.
- **Advanced Filtering & Search:** Filter by Category (Scooters, Sports Bikes, Cruisers, Electric Rides), Daily Price Range, Brand (Honda, TVS, Suzuki, Bajaj, Royal Enfield, Ather), Transmission, and Fuel Type.
- **Smart Conflict & Double-Booking Prevention:** Automatically detects overlapping reservations across dates/times and disables booking for unavailable windows.
- **Live Fare Calculator:** Accurate duration calculation (hourly & daily rates), 18% GST calculation, and refundable security deposit handling.
- **Multi-Method Simulated Checkout:**
  - Credit & Debit Cards (with live interactive visual card preview and Luhn validation)
  - Dedicated Gateways for Visa, MasterCard, RuPay, and American Express
  - Instant UPI (Google Pay, PhonePe, Paytm VPA handles)
  - Direct Netbanking with leading Indian banks (SBI, HDFC, ICICI, Axis, Kotak, PNB)
  - Cash on Delivery (Pay at pickup after physical inspection)
- **Two-Factor Authentication (OTP):** Live 6-digit demo OTP generator with auto-advance inputs and a 30-second resend cooldown timer.
- **Printable & Downloadable Receipts:** Full transaction voucher generation with one-click print styling and `.txt` summary export.

### 🏢 Fleet Provider Experience
- **Role-Based Authentication:** Clean switching between Consumer and Fleet Provider accounts.
- **Interactive Provider Dashboard:**
  - Real-time KPI Metric Cards: Total Fleet, Active Vehicles, Total Bookings, Pending Bookings, Total Revenue, and Monthly Earnings.
  - Interactive Monthly Revenue Bar Chart.
  - Fleet management table: live toggle between **Active (Online)** and **Offline** states.
  - Full CRUD operations: Add new vehicles (`create.html`) and edit or safely delete listings (`del.html`).
  - Booking Management: Review incoming rental requests with one-click **Accept**, **Reject**, or **Mark Completed** actions that synchronize across all user accounts.
  - Financial Ledger: Transaction history with net earnings tracking.

---

## 🏗️ Architecture & Project Structure

```text
Rentro-Rentals/
│
├── index.html                  # Landing Page (Hero, search widget, categories, cities, reviews)
├── Readme.md                   # Complete platform documentation
│
├── html/                       # Application Views
│   ├── city.html               # City selector & search
│   ├── search.html             # Vehicle search & filter engine
│   ├── vehicle.html            # Vehicle details, specifications, & live booking widget
│   ├── confirm.html            # Reservation summary & primary rider confirmation
│   ├── payment.html            # Unified payment hub (Card, UPI, Netbanking, Wallets, COD)
│   ├── payc1.html              # Dedicated Debit Card gateway
│   ├── payc2.html              # Dedicated Credit Card gateway
│   ├── payc3.html              # Dedicated Netbanking portal
│   ├── otp.html                # 3D Secure OTP verification
│   ├── success.html            # Order receipt voucher & download/print actions
│   ├── login.html              # Role-based sign in with demo accounts
│   ├── signup.html             # Customer & Provider onboarding
│   ├── profile-collection.html # User profile & host bank settlement settings
│   ├── dashboard.html          # Provider fleet operations dashboard
│   ├── create.html             # Add new vehicle listing
│   └── del.html                # Fleet management & vehicle editing
│
├── scripts/                    # Modular ES6+ JavaScript Layer
│   ├── storage.js              # Centralized localStorage engine & initial seed data
│   ├── auth.js                 # Session management, authentication, & route guards
│   ├── vehicles.js             # Vehicle CRUD, filtering, & booking conflict detection
│   ├── bookings.js             # Pricing engine, booking creation, & provider analytics
│   ├── payments.js             # Demo payment routing & OTP generation
│   ├── validation.js           # Form validation, credit card, phone, & email checkers
│   ├── utils.js                # Currency formatters, date calculators, toast notifications, modals
│   ├── search.js               # Search page controller & live filter bindings
│   └── dashboard.js            # Provider dashboard controller & chart updates
│
├── styles/                     # Modern Design System
│   ├── global.css              # CSS variables, typography, buttons, inputs, toasts, modals
│   ├── landing.css             # Hero, category cards, vehicle cards, cities grid, footer
│   ├── search.css              # Search layout, filter sidebar, category chips
│   ├── vehicle.css             # Detail gallery, specs 6-grid, sticky booking widget
│   ├── booking.css             # Checkout review, card preview mockup, OTP screen, receipt
│   ├── auth.css                # Sign in/up forms, role switcher tabs
│   ├── dashboard.css           # Dashboard sidebar, metrics, tables, bar chart
│   └── responsive.css          # Mobile drawer & comprehensive breakpoints
│
└── images/                     # Vehicle photos, city skylines, and UI assets
```

---

## 🚀 How to Run the Application

This is a pure static frontend multi-page application. No build step, compiler, or external backend server is required.

### Method 1: VS Code Live Server (Recommended)
1. Open the `Rentro-Rentals` directory in VS Code.
2. Right-click `index.html` and click **"Open with Live Server"**.
3. The app will launch in your browser at `http://127.0.0.1:5501/index.html`.

### Method 2: Node.js Static Server
```bash
cd "c:\Users\varun\Desktop\retro rentals\Rentro-Rentals"
npx serve
```
Then open the local URL (e.g. `http://localhost:3000`).

### Method 3: Direct Browser Launch
Simply double-click `index.html` in Windows File Explorer to open directly in Google Chrome or Microsoft Edge.

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Name | Email | Password |
|---|---|---|---|
| **Customer** | Rahul Sharma | `rahul@example.com` | `password123` |
| **Fleet Provider** | Kiran Kumar (Coastal Wheels) | `provider@example.com` | `password123` |
| **Fleet Provider 2** | Suresh Varma (Metro Urban) | `metro@example.com` | `password123` |

*(Quick one-click demo login buttons are provided on `login.html`)*
