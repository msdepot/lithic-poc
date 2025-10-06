# Lithic POC - Setup Guide

This guide walks you through installing and running the Lithic POC application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

## Quick Start

If you just want to get started quickly:

```bash
# 1. Install dependencies
npm install && cd frontend && npm install && cd ..

# 2. Start the application
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## Detailed Setup Instructions

### Step 1: Install Dependencies

#### Backend Dependencies

```bash
# From the project root
npm install
```

This installs:
- express - Web framework
- cors - CORS middleware
- dotenv - Environment variable management
- sequelize - ORM for database
- sqlite3 - SQLite database driver
- pg, pg-hstore - PostgreSQL support (optional)
- jsonwebtoken - JWT authentication
- axios - HTTP client for Lithic API
- uuid - Unique ID generation
- nodemon - Development server with auto-restart
- concurrently - Run multiple commands simultaneously

#### Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Return to project root
cd ..
```

This installs:
- react - Frontend framework
- react-dom - React DOM rendering
- react-router-dom - Client-side routing
- axios - HTTP client for API calls
- react-scripts - Build tools and scripts

### Step 2: Environment Configuration

The project comes with a pre-configured `.env` file. You can review or modify it if needed:

```env
# Server Configuration
PORT=3001

# Database Configuration
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Lithic API Configuration
LITHIC_API_KEY=595234f1-968e-4fad-b308-41f6e19bc93f
LITHIC_BASE_URL=https://sandbox.lithic.com/v1

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@123
```

**Note:** The Lithic API key is already configured for the sandbox environment.

### Step 3: Start the Application

#### Option 1: Start Both Frontend and Backend Together (Recommended)

```bash
npm run dev
```

This will start:
- **Backend** on http://localhost:3001
- **Frontend** on http://localhost:3000

#### Option 2: Start Backend and Frontend Separately

In one terminal:
```bash
npm run server
```

In another terminal:
```bash
cd frontend
npm start
```

### Step 4: Verify Installation

1. Open your browser to http://localhost:3000
2. You should see the login page with two tabs:
   - **Admin CRM** - For admin login
   - **User Login** - For user login

If you see this, the installation was successful!

---

## Database Setup

### SQLite (Default)

The application uses SQLite by default, which requires **no setup**:

- Database file: `database.sqlite`
- Location: Project root directory
- Created automatically on first run
- All tables are created automatically by Sequelize

### PostgreSQL (Optional)

If you want to use PostgreSQL instead:

#### 1. Install PostgreSQL

- **Mac:** `brew install postgresql`
- **Ubuntu:** `sudo apt-get install postgresql`
- **Windows:** Download from postgresql.org

#### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lithic_poc;

# Create user (optional)
CREATE USER lithic_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lithic_poc TO lithic_user;
```

#### 3. Update .env

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lithic_poc
DB_USER=lithic_user
DB_PASSWORD=your_password
```

#### 4. Remove SQLite configuration

Comment out or remove:
```env
# DB_STORAGE=./database.sqlite
```

### Supabase (Cloud PostgreSQL)

If you want to use Supabase:

#### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Get your connection details

#### 2. Update .env

```env
DB_DIALECT=postgres
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
```

---

## Troubleshooting

### Port Already in Use

**Problem:** Port 3000 or 3001 is already in use

**Solution:**
```bash
# Option 1: Kill the process using the port
# On Mac/Linux:
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Change the port in .env
# Edit .env and change PORT=3001 to PORT=3002
```

### Dependencies Installation Fails

**Problem:** `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules frontend/node_modules

# Remove lock files
rm package-lock.json frontend/package-lock.json

# Reinstall
npm install
cd frontend && npm install && cd ..
```

### Database Not Created

**Problem:** SQLite database file not created

**Solution:**
```bash
# Ensure you're in the project root
cd /workspace

# Start the backend manually to see errors
npm run server
```

The database should be created automatically. Check console for errors.

### Cannot Connect to Backend

**Problem:** Frontend shows "Cannot connect to server"

**Solution:**
1. Verify backend is running: http://localhost:3001
2. Check backend console for errors
3. Verify CORS is enabled in `backend/server.js`
4. Check frontend API URL in `frontend/src/*` files (should be `http://localhost:3001`)

### Lithic API Errors

**Problem:** Getting 401 or API errors from Lithic

**Solution:**
1. Verify `LITHIC_API_KEY` in `.env` is correct
2. Check you're using sandbox URL: `https://sandbox.lithic.com/v1`
3. Review Lithic API logs in backend console

### Module Not Found Errors

**Problem:** `Error: Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall dependencies
npm install
cd frontend && npm install && cd ..

# If specific module is missing, install it:
npm install xyz
```

---

## Running Scripts

The project includes several npm scripts:

### Backend Scripts

```bash
# Start backend in development mode (with nodemon)
npm run server

# Start backend in production mode
node backend/server.js
```

### Frontend Scripts

```bash
# Start frontend development server
cd frontend
npm start

# Build frontend for production
cd frontend
npm run build
```

### Combined Scripts

```bash
# Start both frontend and backend
npm run dev

# Install all dependencies
npm run setup
```

---

## Project Structure After Setup

After successful setup, your project should look like this:

```
lithic-poc/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── node_modules/     ← Created after npm install
│   ├── public/
│   ├── src/
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SETUP.md         ← This file
│   └── ...
├── node_modules/         ← Created after npm install
├── database.sqlite       ← Created after first run
├── .env
├── package.json
└── README.md
```

---

## Optional: Docker Setup

If you prefer to use Docker for PostgreSQL:

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432.

### 2. Update .env

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lithic_poc
DB_USER=lithic_user
DB_PASSWORD=lithic_password
```

### 3. Start Application

```bash
npm run dev
```

---

## Resetting the Application

If you want to start fresh:

### Reset Database Only

```bash
# Delete SQLite database
rm database.sqlite

# Restart application (will recreate database)
npm run dev
```

### Reset Everything

```bash
# Remove all dependencies and database
rm -rf node_modules frontend/node_modules database.sqlite

# Reinstall
npm install
cd frontend && npm install && cd ..

# Start fresh
npm run dev
```

---

## Next Steps

Once setup is complete:

1. **Test the application:** See [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete testing instructions
2. **Understand the architecture:** Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it works
3. **Review the TODO list:** Check [TODO.md](TODO.md) for the complete workflow

---

## Production Deployment Considerations

If you plan to deploy this to production:

1. **Environment Variables:**
   - Use production-grade secrets for `JWT_SECRET`
   - Never commit `.env` to version control
   - Use environment-specific configuration

2. **Database:**
   - Switch to PostgreSQL or cloud database
   - Set up database backups
   - Use connection pooling

3. **Security:**
   - Enable HTTPS/TLS
   - Add rate limiting
   - Implement proper password authentication
   - Use secure session management

4. **Monitoring:**
   - Add application monitoring (Datadog, New Relic, etc.)
   - Set up error tracking (Sentry, Rollbar, etc.)
   - Implement logging

5. **Performance:**
   - Add caching layer (Redis)
   - Use CDN for static assets
   - Optimize database queries
   - Load balancing for multiple instances

---

## Support

If you encounter issues not covered here:

1. Check the backend console for error messages
2. Check the browser console for frontend errors
3. Review the [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
4. Verify all prerequisites are installed correctly
