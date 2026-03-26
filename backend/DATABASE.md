# Database Documentation

## Overview

The MediFinder backend uses **SQLite** as its database. SQLite is a lightweight, serverless database perfect for development and small to medium production deployments.

## Database Location

- **File:** `backend/data/medifinder.db`
- **Size:** ~72KB (initial seed)
- **Type:** SQLite 3

## Schema

### Tables

#### 1. `pharmacies`
Stores pharmacy information.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique pharmacy identifier |
| name | TEXT | Pharmacy name |
| sector | TEXT | Location/sector |
| address | TEXT | Full address |
| phone | TEXT | Contact phone number |
| delivery | BOOLEAN | Delivery availability |
| lat | REAL | Latitude |
| lng | REAL | Longitude |
| description | TEXT | Pharmacy description |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

#### 2. `insurance_types`
Stores available insurance providers.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment ID |
| name | TEXT (UNIQUE) | Insurance provider name |
| created_at | DATETIME | Creation timestamp |

#### 3. `pharmacy_insurance`
Junction table for many-to-many relationship between pharmacies and insurance types.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment ID |
| pharmacy_id | TEXT (FK) | References pharmacies.id |
| insurance_id | INTEGER (FK) | References insurance_types.id |

#### 4. `medicines`
Stores medicine information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment ID |
| name | TEXT | Medicine name |
| strength | TEXT | Strength/dosage (e.g., "500mg", "5% w/v") |
| requires_prescription | BOOLEAN | Prescription requirement |
| created_at | DATETIME | Creation timestamp |

#### 5. `pharmacy_stocks`
Stores stock information for each pharmacy.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment ID |
| pharmacy_id | TEXT (FK) | References pharmacies.id |
| medicine_id | INTEGER (FK) | References medicines.id |
| price_rwf | REAL | Price in Rwandan Francs |
| quantity | INTEGER | Available quantity |

#### 6. `users`
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique user identifier |
| email | TEXT (UNIQUE) | User email |
| name | TEXT | User full name |
| phone | TEXT | Contact phone |
| password | TEXT | Hashed password |
| role | TEXT | User role (default: 'user') |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

## Database Initialization

The database is automatically initialized when the server starts:

```javascript
// In src/server.js
initializeDatabase(); // Creates tables if they don't exist
```

## Seeding the Database

To populate the database with pharmacy data:

```bash
cd backend
npm run seed
```

This will:
1. Clear existing data
2. Insert insurance types
3. Insert pharmacies (7 pharmacies from your data)
4. Link pharmacies to insurance providers
5. Insert medicines
6. Insert pharmacy stocks with prices and quantities

## Current Data

### Pharmacies (7 total)
1. **Adrenaline Pharmacy Ltd** - Kabeza
2. **PHARMACIE PHARMALAB** - Kigali
3. **Pharmacie Conseil** - Kigali
4. **AfriChem Rwanda Ltd** - Kigali
5. **PHARMACIE CONTINENTALE** - Kigali
6. **Kipharma** - Nyarugenge
7. **Oasis Pharmacy** - Kigali

### Insurance Providers (11 total)
- Britam
- Eden Care Medical
- Radiant Insurance
- Military Medical Insurance
- Old Mutual Insurance Rwanda
- Prime Insurance
- Sanlam Allianz Life Insurance Plc
- SAHAM ASSURANCE RWANDA
- Sonarwa
- Medical Insurance Scheme Of University Of Rwanda
- Zion Insurance Brokers Ltd

### Medicines
Over 30 unique medicines including:
- Azithromycin
- Paracetamol
- Ibuprofen
- Ciprofloxacin
- Omeprazole
- And many more...

## Querying the Database

### Using the API

```bash
# Get all pharmacies
curl "http://localhost:3000/api/pharmacies"

# Search by medicine
curl "http://localhost:3000/api/pharmacies?q=Azithromycin"

# Filter by location
curl "http://localhost:3000/api/pharmacies?loc=Kabeza"

# Filter by insurance
curl "http://localhost:3000/api/pharmacies?insurance=Britam"

# Get single pharmacy
curl "http://localhost:3000/api/pharmacies/ph-001"
```

### Direct Database Access

You can use SQLite command-line tools:

```bash
# Install sqlite3 (if not installed)
# macOS: brew install sqlite3
# Linux: sudo apt-get install sqlite3

# Open database
sqlite3 backend/data/medifinder.db

# Example queries
SELECT * FROM pharmacies;
SELECT * FROM medicines WHERE name LIKE '%Azithromycin%';
SELECT p.name, it.name as insurance FROM pharmacies p
JOIN pharmacy_insurance pi ON p.id = pi.pharmacy_id
JOIN insurance_types it ON pi.insurance_id = it.id;
```

## Backup and Restore

### Backup
```bash
# Copy the database file
cp backend/data/medifinder.db backend/data/medifinder.db.backup
```

### Restore
```bash
# Replace with backup
cp backend/data/medifinder.db.backup backend/data/medifinder.db
```

## Migration to Production Database

To migrate to PostgreSQL or MySQL for production:

1. **Update database connection** in `src/database/schema.js`
2. **Install database driver**:
   - PostgreSQL: `npm install pg`
   - MySQL: `npm install mysql2`
3. **Update SQL syntax** if needed (most should be compatible)
4. **Run seed script** on production database

## Database Maintenance

### Reset Database
```bash
# Delete database file and reseed
rm backend/data/medifinder.db
npm run seed
```

### Clear All Data
```bash
# The seed script clears existing data before seeding
npm run seed
```

## Performance Considerations

- **Indexes** are created on frequently queried columns:
  - `pharmacies.sector`
  - `pharmacy_stocks.pharmacy_id`
  - `pharmacy_stocks.medicine_id`
  - `medicines.name`

- **Foreign Keys** are enabled for data integrity

- For production with high traffic, consider:
  - Migrating to PostgreSQL
  - Adding connection pooling
  - Implementing query caching
  - Adding more indexes based on usage patterns

## Troubleshooting

### Database Locked Error
- Close all connections to the database
- Restart the server

### Missing Database File
- Run `npm run seed` to create and populate the database

### Schema Changes
- Delete the database file and reseed
- Or create a migration script for production

### Pharmacy dashboard: “not linked to a pharmacy” / empty stock & insurance
- Pharmacy features require `users.pharmacy_id` to match a row in `pharmacies`.
- **Repair default `@medifinder.local` accounts** (same email rule as seed pharmacy users): from `backend/`, run `npm run fix-pharmacy-links`.
- **Fuzzy-match** users without `pharmacy_id` by name/phone: `npm run link-pharmacies`.
- **Create missing accounts** for pharmacies with no user: `npm run create-pharmacy-users`.
- **Inspect** counts: `npm run check-pharmacy-links`.
- If stock/insurance lists are empty after linking, ensure data exists: `npm run seed` (or add stock/partners in the dashboard).
- After fixing the database, **log out and log in again** so the client gets an updated JWT (which includes `pharmacyId` when set).

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- Database file should not be committed to version control (see `.gitignore`)
- In production, restrict file system access to database file
- Consider encrypting the database file for sensitive data

