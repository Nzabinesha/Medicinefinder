# MediFinder Backend API

Backend API server for the MediFinder application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

   Or:
   ```bash
   npm start
   ```

3. **Server will run on:**
   ```
   http://localhost:3000
   ```

## 📡 API Endpoints

### Health Check
- **GET** `/health`
  - Returns server status

### Pharmacies
- **GET** `/api/pharmacies`
  - Query parameters:
    - `q` - Search medicine name
    - `loc` - Filter by location/sector
    - `insurance` - Filter by insurance type (RSSB, Mutuelle, Private-A, Private-B)
  - Returns: Array of pharmacies

- **GET** `/api/pharmacies/:id`
  - Returns: Single pharmacy details

### Authentication
- **POST** `/api/auth/signup`
  - Body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "phone": "+250788123456" // Optional
    }
    ```
  - Returns: User object and JWT token

- **POST** `/api/auth/login`
  - Body:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - Returns: User object and JWT token

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

### Default Configuration
- **Port:** 3000
- **JWT Secret:** `medifinder-secret-key-change-in-production` (change in production!)
- **Token Expiry:** 7 days

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js          # Main server file
│   ├── data.js            # Mock data storage
│   └── routes/
│       ├── pharmacies.js  # Pharmacy routes
│       └── auth.js        # Authentication routes
├── package.json
└── README.md
```

## 🛠️ Technologies

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## 📝 Notes

- Currently uses in-memory storage for users (resets on server restart)
- In production, use a database (MongoDB, PostgreSQL, etc.)
- Change JWT_SECRET in production
- Add proper error handling and logging
- Implement rate limiting
- Add authentication middleware for protected routes

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is enabled for frontend communication
- Input validation on all endpoints

## 🚀 Deployment

### Build
No build step required - just run the server directly.

### Production
1. Set environment variables
2. Use a process manager (PM2, forever, etc.)
3. Use a reverse proxy (Nginx, etc.)
4. Enable HTTPS
5. Use a database instead of in-memory storage

## 📚 API Examples

### Search Pharmacies
```bash
curl "http://localhost:3000/api/pharmacies?q=Amoxicillin&loc=Kacyiru"
```

### Get Single Pharmacy
```bash
curl "http://localhost:3000/api/pharmacies/rx-001"
```

### Sign Up
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

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License

