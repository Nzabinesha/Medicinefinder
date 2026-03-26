# Backend Documentation Quick Reference

## 📍 Where to Find Documentation

### 1. Complete API Documentation
**File:** `backend/API_DOCS.md`
- Full API documentation with all endpoints
- Request/response examples
- Data models and error responses
- Testing examples

### 2. Quick Start Guide
**File:** `backend/README.md`
- Installation instructions
- Basic API overview
- Configuration guide

### 3. Interactive API Endpoint
**URL:** `http://localhost:3000/api-docs`
- JSON endpoint listing all available endpoints
- Quick reference for API structure

## 🔗 Quick Links

- **Health Check:** http://localhost:3000/health
- **API Base URL:** http://localhost:3000/api
- **API Docs Endpoint:** http://localhost:3000/api-docs

## 📚 Available Endpoints

### Pharmacies
- `GET /api/pharmacies` - Search pharmacies
- `GET /api/pharmacies/:id` - Get single pharmacy

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

### System
- `GET /health` - Health check
- `GET /api-docs` - API documentation

## 💡 Quick Access

Open the documentation files in your editor or view them in the terminal:

```bash
# View complete API docs
cat backend/API_DOCS.md

# View README
cat backend/README.md

# View API endpoint (when server is running)
curl http://localhost:3000/api-docs
```
