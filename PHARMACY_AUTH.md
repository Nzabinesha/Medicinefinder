# Pharmacy Authentication Guide

## Overview

Pharmacies can now register and login to access their dedicated dashboard for managing orders, stock, and prescriptions.

## 🔗 Access Points

### Pharmacy Login
- **URL:** `http://localhost:5173/pharmacy/login`
- **Route:** `/pharmacy/login`
- **Purpose:** Login for existing pharmacy accounts

### Pharmacy Signup
- **URL:** `http://localhost:5173/pharmacy/signup`
- **Route:** `/pharmacy/signup`
- **Purpose:** Register a new pharmacy account

### Pharmacy Dashboard
- **URL:** `http://localhost:5173/dashboard`
- **Route:** `/dashboard`
- **Access:** Protected - Only pharmacies can access
- **Purpose:** Manage orders, stock, and prescriptions

## 📝 Registration Process

### Step 1: Sign Up
1. Navigate to `/pharmacy/signup`
2. Fill in the form:
   - **Pharmacy Name** (required)
   - **Email Address** (required)
   - **Phone Number** (required)
   - **Password** (required, min 6 characters)
   - **Confirm Password** (required)
   - **Terms & Conditions** (required checkbox)
3. Click "Register Pharmacy"
4. You'll be automatically logged in and redirected to the dashboard

### Step 2: Access Dashboard
- After registration, you're automatically redirected to `/dashboard`
- The dashboard shows:
  - **Orders Tab**: View and manage incoming orders
  - **Stock Management Tab**: Update medicine stock and prices

## 🔐 Login Process

1. Navigate to `/pharmacy/login`
2. Enter your pharmacy email and password
3. Click "Login to Dashboard"
4. If successful, you'll be redirected to `/dashboard`

### Security Features
- ✅ Role-based access control (only pharmacies can access dashboard)
- ✅ Automatic redirect if non-pharmacy user tries to access
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Session persistence (stays logged in after page refresh)

## 🛡️ Route Protection

The dashboard route is protected:
- **Unauthenticated users** → Redirected to `/pharmacy/login`
- **Regular users** → Redirected to home page
- **Pharmacy users** → Access granted to dashboard

## 📊 Dashboard Features

### Orders Management
- View all incoming orders
- See order status (pending, confirmed, processing, ready, delivered)
- Verify/reject prescriptions
- Update order status
- View customer information and delivery addresses

### Stock Management
- View all medicines in stock
- Update quantities
- Adjust prices
- See prescription requirements

## 🔧 Backend API

### Signup Endpoint
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Pharmacy Name",
  "email": "pharmacy@example.com",
  "password": "password123",
  "phone": "+250788123456",
  "role": "pharmacy"
}
```

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "pharmacy@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "user": {
    "id": "pharmacy-1234567890-abc123",
    "email": "pharmacy@example.com",
    "name": "Pharmacy Name",
    "phone": "+250788123456",
    "role": "pharmacy",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🧪 Testing

### Test Pharmacy Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pharmacy",
    "email": "test@pharmacy.com",
    "password": "test123",
    "phone": "+250788123456",
    "role": "pharmacy"
  }'
```

### Test Pharmacy Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@pharmacy.com",
    "password": "test123"
  }'
```

## 🎯 User Roles

### Regular User (`role: 'user'`)
- Can search pharmacies
- Can place orders
- Can upload prescriptions
- **Cannot** access pharmacy dashboard

### Pharmacy (`role: 'pharmacy'`)
- Can access pharmacy dashboard
- Can manage orders
- Can update stock
- Can verify prescriptions
- **Cannot** place orders (future feature)

## 🔄 Navigation

### From Home Page
- Click "🏥 Pharmacy Login" button in hero section
- Or use "Pharmacy Login" link in navigation (when not logged in)

### From Navigation
- **When logged in as pharmacy**: "Dashboard" link appears in navigation
- **When not logged in**: "Pharmacy Login" link appears in navigation

## 📱 User Experience

1. **Pharmacy signs up** → Automatically logged in → Redirected to dashboard
2. **Pharmacy logs in** → Redirected to dashboard
3. **Regular user tries to access dashboard** → Redirected to home
4. **Unauthenticated user tries to access dashboard** → Redirected to pharmacy login

## 🔒 Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Role is validated on both frontend and backend
- Protected routes check authentication and role before allowing access

## 🐛 Troubleshooting

### Can't Access Dashboard
1. Make sure you're logged in
2. Verify your account has `role: 'pharmacy'`
3. Check browser console for errors
4. Try logging out and logging back in

### Login Fails
1. Verify email and password are correct
2. Check if account exists in database
3. Check backend server is running
4. Check browser console for API errors

### Role Not Saving
1. Make sure backend server is restarted after code changes
2. Check database to verify role is saved correctly
3. Clear browser localStorage and try again

## 📚 Related Documentation

- **Backend API Docs:** `backend/API_DOCS.md`
- **Database Docs:** `backend/DATABASE.md`
- **Backend README:** `backend/README.md`

---

**Last Updated:** 2024-01-01

