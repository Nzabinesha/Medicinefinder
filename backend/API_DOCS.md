# MediFinder Backend API Documentation

Complete API documentation for the MediFinder backend server.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Pharmacies](#pharmacies)
  - [Authentication](#authentication-endpoints)
- [Data Models](#data-models)
- [Error Responses](#error-responses)
- [Examples](#examples)

## 🔗 Base URL

```
http://localhost:3000/api
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After signing up or logging in, you'll receive a token that should be included in the `Authorization` header for protected routes.

```
Authorization: Bearer <your-token>
```

**Note:** Currently, all endpoints are public. Authentication middleware will be added for protected routes in the future.

## 📡 Endpoints

### Health Check

#### GET `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "MediFinder API is running"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

### Pharmacies

#### GET `/api/pharmacies`

Search and filter pharmacies.

**Query Parameters:**
- `q` (optional) - Search medicine name
- `loc` (optional) - Filter by location/sector
- `insurance` (optional) - Filter by insurance type (RSSB, Mutuelle, Private-A, Private-B)

**Response:** Array of pharmacy objects

**Example:**
```bash
# Get all pharmacies
curl "http://localhost:3000/api/pharmacies"

# Search by medicine name
curl "http://localhost:3000/api/pharmacies?q=Amoxicillin"

# Filter by location
curl "http://localhost:3000/api/pharmacies?loc=Kacyiru"

# Filter by insurance
curl "http://localhost:3000/api/pharmacies?insurance=RSSB"

# Combine filters
curl "http://localhost:3000/api/pharmacies?q=Paracetamol&loc=Remera&insurance=Mutuelle"
```

**Response Example:**
```json
[
  {
    "id": "rx-001",
    "name": "Kacyiru Health Pharmacy",
    "sector": "Kacyiru",
    "accepts": ["RSSB", "Mutuelle", "Private-A"],
    "delivery": true,
    "phone": "+250788000111",
    "lat": -1.9447,
    "lng": 30.0614,
    "stocks": [
      {
        "id": "med-amox",
        "name": "Amoxicillin",
        "strength": "500mg",
        "priceRWF": 2500,
        "requiresPrescription": true,
        "quantity": 24
      }
    ]
  }
]
```

#### GET `/api/pharmacies/:id`

Get details of a single pharmacy.

**Path Parameters:**
- `id` (required) - Pharmacy ID

**Response:** Single pharmacy object

**Example:**
```bash
curl "http://localhost:3000/api/pharmacies/rx-001"
```

**Response Example:**
```json
{
  "id": "rx-001",
  "name": "Kacyiru Health Pharmacy",
  "sector": "Kacyiru",
  "accepts": ["RSSB", "Mutuelle", "Private-A"],
  "delivery": true,
  "phone": "+250788000111",
  "lat": -1.9447,
  "lng": 30.0614,
  "stocks": [
    {
      "id": "med-amox",
      "name": "Amoxicillin",
      "strength": "500mg",
      "priceRWF": 2500,
      "requiresPrescription": true,
      "quantity": 24
    },
    {
      "id": "med-par",
      "name": "Paracetamol",
      "strength": "500mg",
      "priceRWF": 500,
      "requiresPrescription": false,
      "quantity": 100
    }
  ]
}
```

**Error Responses:**
- `404` - Pharmacy not found
- `500` - Server error

---

### Authentication Endpoints

#### POST `/api/auth/signup`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+250788123456"
}
```

**Required Fields:**
- `name` - User's full name
- `email` - User's email address
- `password` - User's password (minimum 6 characters)

**Optional Fields:**
- `phone` - User's phone number

**Response:**
```json
{
  "user": {
    "id": "user-1234567890-abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+250788123456",
    "role": "user",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+250788123456"
  }'
```

**Error Responses:**
- `400` - Validation error (missing fields or password too short)
- `409` - User already exists
- `500` - Server error

#### POST `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` - User's email address
- `password` - User's password

**Response:**
```json
{
  "user": {
    "id": "user-1234567890-abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+250788123456",
    "role": "user",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Error Responses:**
- `400` - Validation error (missing fields)
- `401` - Invalid email or password
- `500` - Server error

---

## 📊 Data Models

### Pharmacy

```typescript
interface Pharmacy {
  id: string;
  name: string;
  sector: string; // Location/neighborhood
  accepts: Insurance[]; // Insurance types accepted
  delivery: boolean;
  phone?: string;
  lat: number; // Latitude
  lng: number; // Longitude
  stocks: MedicineStock[];
}
```

### MedicineStock

```typescript
interface MedicineStock {
  id: string;
  name: string;
  strength: string; // e.g., "500mg"
  priceRWF: number; // Price in Rwandan Francs
  requiresPrescription: boolean;
  quantity: number; // Available quantity
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'pharmacy';
  createdAt: string; // ISO date string
}
```

### Insurance Types

- `RSSB` - Rwanda Social Security Board
- `Mutuelle` - Community-based health insurance
- `Private-A` - Private insurance type A
- `Private-B` - Private insurance type B

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

### Common Status Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication failed)
- `404` - Not Found (resource not found)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## 💡 Examples

### Complete Authentication Flow

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+250788123456"
  }'

# Response contains token - save it for future requests
# Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Login (alternative)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Use token for protected routes (future)
# curl -H "Authorization: Bearer <token>" http://localhost:3000/api/pharmacies
```

### Search Examples

```bash
# Find pharmacies with Amoxicillin in Kacyiru
curl "http://localhost:3000/api/pharmacies?q=Amoxicillin&loc=Kacyiru"

# Find pharmacies that accept RSSB insurance
curl "http://localhost:3000/api/pharmacies?insurance=RSSB"

# Find pharmacies with Paracetamol in Remera that accept Mutuelle
curl "http://localhost:3000/api/pharmacies?q=Paracetamol&loc=Remera&insurance=Mutuelle"

# Get all pharmacies
curl "http://localhost:3000/api/pharmacies"

# Get specific pharmacy
curl "http://localhost:3000/api/pharmacies/rx-001"
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

### Default Values

- **Port:** 3000
- **JWT Secret:** `medifinder-secret-key-change-in-production`
- **Token Expiry:** 7 days

---

## 📝 Notes

- All endpoints return JSON
- All dates are in ISO 8601 format
- Prices are in Rwandan Francs (RWF)
- User passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Currently uses in-memory storage (data resets on server restart)

---

## 🚀 Testing

### Using curl

All examples in this documentation use `curl`. Make sure you have curl installed on your system.

### Using Postman

1. Import the API endpoints into Postman
2. Set base URL to `http://localhost:3000/api`
3. Use the examples above as reference

### Using JavaScript/Fetch

```javascript
// Sign up
const response = await fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+250788123456'
  })
});

const data = await response.json();
console.log(data);
```

---

## 📚 Additional Resources

- [Backend README](../backend/README.md) - Setup and installation
- [Frontend Documentation](../README.md) - Frontend application docs
- [Express.js Documentation](https://expressjs.com/) - Express framework docs
- [JWT Documentation](https://jwt.io/) - JSON Web Tokens docs


