# MediFinder - Medicine Finder for Kigali, Rwanda

A modern web application that helps residents of Kigali find pharmacies with their prescribed medicines in stock, verify insurance acceptance, and order medicines online with home delivery.

**Stack:** React (Vite) frontend and Express backend; all application data lives in **Supabase (PostgreSQL)** — no SQLite. The backend validates auth, writes orders, and manages pharmacy dashboards through a single Supabase client using the service role key (server-side only).

## 🎯 Problem Statement

**Context (Kigali City, Rwanda):**
- Difficulty locating pharmacies with required medicines
- Many people move across the city searching for pharmacies that stock their prescribed drugs
- Patients often don't know whether a pharmacy has their medicine, causing wasted trips and delays
- They do not know if there are pharmacies around them
- Insurance-related barriers - pharmacies may prefer cash payments over insurance claims

**Impact:**
- Time wasted traveling between pharmacies
- Delayed access to medication
- Financial and emotional stress for patients

**Solution:**
A digital platform that displays pharmacies with prescribed medicine in stock, shows insurance acceptance, enables online ordering with home delivery, and provides prescription verification.

## ✨ Features

### For Patients/Users

#### 🔍 Medicine Search & Discovery
- **Search by Medicine Name**: Find pharmacies that have specific medicines in stock
- **Location Filtering**: Filter pharmacies by sector/location in Kigali
- **Insurance Filtering**: Filter pharmacies by insurance type (RSSB, Mutuelle, RAMA, Eden care, Britam, .)
- **Interactive Maps**: View pharmacy locations on an interactive map using Leaflet
- **Pharmacy Details**: View detailed information about each pharmacy including contact, address, and available medicines
- AI chatbot to ask questions about medicine their mechanism and how to proper use it.

#### 🔐 Authentication
- **User Registration**: Create an account with email, name, and phone
- **Secure Login**: JWT-based authentication
- **Session Management**: Persistent login sessions

#### 📋 Prescription & Ordering

- **Shopping Cart**: Add medicines to cart with quantity selection
- **Online Ordering**: Place orders with delivery or pickup options
- **Delivery Address**: Specify delivery address for home delivery
- **Prescription Upload**: Upload prescription images (PDF, JPG, PNG) for verification
- **Prescription Status**: Track prescription approval status (pending, approved, rejected)
- **Order Tracking**: View all placed orders with status updates
- **Order History**: Access complete order history with details

#### 🔔 Notifications
- **Order Confirmation**: Receive confirmation when orders are placed
- **Status Updates**: Get notified about order status changes

### For Pharmacy Staff

#### 📊 Pharmacy Dashboard
- **Comprehensive Dashboard**: Manage all pharmacy operations from one place
- **Pharmacy Information**: View pharmacy details and contact information

#### 💊 Stock Management
- **View Stock**: See all medicines currently in stock with quantities and prices
- **Add Stock**: Add new medicines to inventory
- **Update Stock**: Modify quantities and prices for existing medicines
- **Delete Stock**: Remove medicines from inventory
- **Medicine Database**: Access full medicine database when adding stock

#### 🏥 Insurance Partners
- **View Insurance Partners**: See all accepted insurance types
- **Add Insurance**: Add new insurance partners
- **Remove Insurance**: Remove insurance partnerships

#### 📦 Order Management
- **View Orders**: See all customer orders with details
- **Order Status**: Update order status (pending, processing, completed, cancelled)
- **Order Details**: View complete order information including:
  - Customer details (name, email, phone)
  - Ordered medicines with quantities
  - Total amount
  - Delivery information
  - Prescription (if applicable)

#### ✅ Prescription Verification
- **View Prescriptions**: See uploaded prescription images
- **Approve Prescriptions**: Approve valid prescriptions
- **Reject Prescriptions**: Reject invalid prescriptions
- **Prescription Status**: Track prescription approval status

## 🚀 Quick Start

MediFinder uses **Supabase (PostgreSQL)** for all data. The backend talks to Supabase with the **service role** key (server only — never expose it in the browser).

### Prerequisites

- **Node.js** v18+
- **npm**
- A **Supabase** project with tables applied (see [Supabase setup](#supabase-setup) below)

### Step-by-step setup

1. **Install dependencies (repository root + backend)**

   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

2. **Create `backend/.env`** (copy from `backend/.env.example` if present) with at least:

   | Variable | Description |
   |----------|-------------|
   | `SUPABASE_URL` | Project URL (Settings → API) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role secret (Settings → API) — backend only |
   | `JWT_SECRET` | Long random string for signing tokens |
   | `PORT` | Optional; default `3000` |

3. **Apply the SQL schema** (once per project): open `backend/supabase/schema.sql` in the Supabase SQL Editor and run it if your project does not already have the same tables (`users`, `pharmacies`, `medicines`, `pharmacy_stocks`, `pharmacy_insurance`, `insurance_types`, `orders`, `order_items`, `notifications`).

4. **Optional — initial demo data** (run only when you want sample pharmacies/medicines; **not** required every time you start the app):

   ```bash
   cd backend
   npm run seed
   ```

   **Warning:** the seed clears catalog tables (`pharmacies`, `medicines`, `stocks`, `insurance` links) and re-inserts demo data. It does not need to run for normal development if your Supabase project is already populated.

5. **Run the backend**

   ```bash
   cd backend
   npm run dev
   ```

   API: `http://localhost:3000` — try `GET http://localhost:3000/health`.

6. **Run the frontend** (new terminal, repository root)

   ```bash
   npm run dev
   ```

   App: `http://localhost:5173`

   Optional root `.env` for the UI:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health check**: http://localhost:3000/health

### Supabase setup

1. Create a project at [https://supabase.com](https://supabase.com).
2. In **SQL → New query**, paste and run `backend/supabase/schema.sql` if tables are missing.
3. Copy **Project URL** and **service_role** key into `backend/.env`.
4. Row Level Security: the API uses the **service role** key and bypasses RLS for server-side operations. Do not use the service role key in frontend code; the React app only calls your Express API.

## 👥 User Accounts

### Pharmacy logins

Create pharmacy accounts from the **admin dashboard** (admin login is configured in the backend) or register with role `pharmacy` and ensure `users.pharmacy_id` is set to the correct `pharmacies.id` in Supabase. There is no SQLite or link-repair script anymore.

### End-user signup

1. Go to http://localhost:5173/signup
2. Fill in your details (name, email, password, phone)
3. Click "Sign Up"
4. You'll be automatically logged in

## 📁 Project Structure

```
medifinder/
├── src/                          # Frontend source code
│   ├── views/                    # Page components
│   │   ├── Home.tsx              # Landing page
│   │   ├── Pharmacies.tsx        # Pharmacy search/list
│   │   ├── PharmacyDetail.tsx    # Single pharmacy view
│   │   ├── Cart.tsx              # Shopping cart
│   │   ├── Prescription.tsx      # Prescription upload
│   │   ├── Orders.tsx            # User order history
│   │   ├── PharmacyDashboard.tsx # Pharmacy management
│   │   ├── Login.tsx             # User login
│   │   ├── Signup.tsx            # User registration
│   │   └── ...
│   ├── ui/                       # Reusable UI components
│   │   ├── RootLayout.tsx        # Main layout with nav/footer
│   │   └── MapView.tsx           # Interactive map component
│   ├── store/                    # State management (Zustand)
│   │   ├── authStore.ts          # Authentication state
│   │   └── cartStore.ts          # Shopping cart state
│   ├── services/                 # API services
│   │   ├── api.ts                # Main API client
│   │   └── dashboardApi.ts      # Dashboard API client
│   └── styles/                   # Global styles
│       └── index.css             # Tailwind CSS
├── backend/                      # Backend API server
│   ├── src/
│   │   ├── server.js             # Express server entry point
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js           # Authentication routes
│   │   │   ├── pharmacies.js     # Pharmacy routes
│   │   │   ├── orders.js          # Order routes
│   │   │   └── dashboard.js      # Dashboard routes
│   │   ├── services/             # Business logic
│   │   │   ├── userService.js    # User management
│   │   │   ├── pharmacyService.js # Pharmacy operations
│   │   │   └── dashboardService.js # Dashboard operations
│   │   ├── lib/                  # Supabase client (service role)
│   │   │   └── supabase.js
│   │   ├── database/             # Optional Supabase seed CLI
│   │   │   └── seed.js
│   │   ├── middleware/           # Express middleware
│   │   │   └── auth.js           # JWT authentication
│   └── supabase/
│       └── schema.sql            # PostgreSQL DDL for Supabase
├── index.html                    # HTML entry point
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI library
- **TypeScript** 5.6.3 - Type safety
- **Vite** 5.4.8 - Build tool and dev server
- **Tailwind CSS** 3.4.14 - Utility-first CSS framework
- **React Router** 6.26.2 - Client-side routing
- **Zustand** 4.5.2 - Lightweight state management
- **Leaflet** 1.9.4 - Interactive maps
- **React Leaflet** 4.2.1 - React bindings for Leaflet

### Backend
- **Express.js** 4.x — Web framework
- **Supabase** (`@supabase/supabase-js`) — PostgreSQL API (service role on server)
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **dotenv** — Load `backend/.env`
- **CORS** — Cross-origin resource sharing

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Pharmacies
- `GET /api/pharmacies` - Search pharmacies (query params: `q`, `loc`, `insurance`)
- `GET /api/pharmacies/:id` - Get single pharmacy details
- `GET /api/pharmacies/list/all` - Get all pharmacies list

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders` - Get user's orders (protected)

### Dashboard (Pharmacy Only)
- `GET /api/dashboard/stock` - Get pharmacy stock
- `POST /api/dashboard/stock` - Add new stock
- `PUT /api/dashboard/stock/:medicineId` - Update stock
- `DELETE /api/dashboard/stock/:medicineId` - Delete stock
- `GET /api/dashboard/medicines` - Get all medicines
- `GET /api/dashboard/orders` - Get pharmacy orders
- `GET /api/dashboard/orders/:orderId` - Get order details
- `PUT /api/dashboard/orders/:orderId/status` - Update order status
- `PUT /api/dashboard/orders/:orderId/prescription` - Update prescription status
- `GET /api/dashboard/insurance` - Get pharmacy insurance partners
- `GET /api/dashboard/insurance/available` - Get all available insurance types
- `POST /api/dashboard/insurance` - Add insurance partner
- `DELETE /api/dashboard/insurance/:insuranceId` - Remove insurance partner

For detailed API documentation, see [backend/API_DOCS.md](backend/API_DOCS.md)

## 🗄️ Database

The application uses **SQLite** for data storage. The database file is located at `backend/data/medifinder.db`.

### Database Schema

- **pharmacies** - Pharmacy information
- **medicines** - Medicine catalog
- **pharmacy_stocks** - Stock levels and prices
- **users** - User accounts (patients and pharmacy staff)
- **orders** - Customer orders
- **order_items** - Order line items
- **insurance_types** - Available insurance providers
- **pharmacy_insurance** - Pharmacy-insurance relationships

For detailed database documentation, see [backend/DATABASE.md](backend/DATABASE.md)

### Seeding the Database

The seed script creates:
- 17 pharmacies across Kigali
- 50+ medicines
- Stock entries for each pharmacy
- Insurance types (RSSB, Mutuelle, Private-A, Private-B)
- Pharmacy-insurance relationships

Run seeding:
```bash
cd backend
npm run seed
```

## 🔐 Authentication & Authorization

### User Roles
- **user** - Regular customers who can search, order medicines
- **pharmacy** - Pharmacy staff who can manage stock, orders, and prescriptions

### JWT Tokens
- Tokens are issued on login
- Tokens are stored in localStorage
- Protected routes require valid JWT token
- Tokens expire after 7 days

## 🚚 Order Flow

1. **Search & Add to Cart**
   - User searches for medicine
   - Views pharmacy details
   - Adds medicines to cart

2. **Prescription Upload** (if required)
   - User uploads prescription image
   - Prescription status: "pending"
   - User can place order (pharmacy will verify)

3. **Place Order**
   - User selects delivery or pickup
   - Provides delivery address (if needed)
   - Places order
   - Order status: "pending"

4. **Pharmacy Processing**
   - Pharmacy views order in dashboard
   - Verifies prescription (if applicable)
   - Updates order status
   - Processes order

5. **Order Completion**
   - Order status: "processing" → "completed"
   - User can track order in "My Orders" page

## 📝 Development

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
API_URL=http://localhost:3000/api
```

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Node.js version (v18+)
- Check database file exists: `backend/data/medifinder.db`

### Frontend won't start
- Check if port 5173 is available
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors

### Database errors
- Run seed script: `cd backend && npm run seed`
- Check database file permissions
- Verify SQLite is properly installed

### Prescription upload issues
- Ensure file size is under 10MB
- Supported formats: PDF, JPG, PNG
- Check browser console for errors

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Made with ❤️ for Kigali, Rwanda**
