# Lithic POC - Card Issuing Platform

A complete proof-of-concept for a card issuing platform using Lithic's sandbox API. This project demonstrates a production-ready full-stack application with real Lithic integration.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install && cd frontend && npm install && cd ..

# 2. Start the application
npm run dev
```

**Then open:** http://localhost:3000

## 📚 Documentation

The project documentation is organized into focused guides:

### Getting Started
- **[docs/SETUP.md](docs/SETUP.md)** - Complete installation and setup instructions
- **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Step-by-step testing guide

### Understanding the Project
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and components
- **[docs/TODO.md](docs/TODO.md)** - Complete workflow (9 steps)

## 📋 What This Project Does

This POC demonstrates a complete card issuing workflow:

1. **Admin CRM** - Create business accounts via Lithic API
2. **User Management** - Create users with role-based access (Owner, Admin, User, Analyst)
3. **Card Issuing** - Issue debit and reloadable cards
4. **Spending Profiles** - Create reusable spending restriction templates
5. **Complete Visibility** - View all users and cards with details

## 🎯 Key Features

- ✅ **Real Lithic Integration** - Uses actual Lithic sandbox API (not mocked)
- ✅ **Full-Stack Application** - Backend (Node.js + Express) + Frontend (React)
- ✅ **Zero Configuration** - SQLite database with automatic setup
- ✅ **Role-Based Access** - 4 user roles with different permissions
- ✅ **Multiple Card Types** - Debit and reloadable cards
- ✅ **Spending Controls** - Custom profiles with limits and merchant restrictions
- ✅ **Email-Only Login** - Passwordless authentication for POC simplicity

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express + Sequelize ORM |
| **Frontend** | React + React Router |
| **Database** | SQLite (PostgreSQL-ready) |
| **Authentication** | JWT |
| **Card Provider** | Lithic Sandbox API |

## 🎨 UI Design

- **Grayscale only** - Focus on functionality
- **Left sidebar navigation** - Easy access to all features
- **Role-based menus** - Different options based on user role
- **Simple forms** - Clean, functional data entry

## 🏗️ Project Structure

```
lithic-poc/
├── backend/              # Node.js + Express API
│   ├── config/          # Lithic API client
│   ├── middleware/      # JWT authentication
│   ├── models/          # Database models (Sequelize)
│   ├── routes/          # API endpoints
│   └── server.js        # Main server file
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Page components
│   └── public/
├── docs/                # Documentation
│   ├── ARCHITECTURE.md  # Technical architecture
│   ├── SETUP.md         # Installation guide
│   ├── TESTING_GUIDE.md # Testing instructions
│   └── TODO.md          # Workflow steps
├── .env                 # Environment configuration
└── package.json         # Dependencies
```

## 🎓 Complete Workflow (9 Steps)

This POC demonstrates a complete workflow:

1. **Admin creates business account** (MSD Cafe) with owner (Eric)
2. **Owner logs in** with email-only authentication
3. **Owner creates 4 users** - Seth (Admin), Gabriel (User), Nathalia (User), Lindsey (Analyst)
4. **Owner creates debit cards** for Eric and Seth
5. **Login as Seth** to demonstrate admin role
6. **Seth creates reloadable card** for Gabriel
7. **Seth creates spending profile** with custom rules (limits + blocked categories)
8. **Seth creates card for Nathalia** with spending profile applied
9. **View all users and cards** to verify complete visibility

**For detailed steps, see:** [docs/TODO.md](docs/TODO.md)

## 🔑 Login Credentials

**Admin CRM:**
- Username: `admin`
- Password: `admin@123`

**Users (after creation):**
- Just enter email (no password needed)
- Examples: `eric@msdcafe.com`, `seth@msdcafe.com`

## 📦 What's Included

**Backend API Routes:**
- `/api/auth/*` - Admin and user login
- `/api/accounts/*` - Account creation and funding
- `/api/users/*` - User management
- `/api/cards/*` - Card creation and listing
- `/api/spending-profiles/*` - Spending profile management

**Frontend Pages:**
- Login (Admin CRM + User Login)
- Admin Dashboard (account creation)
- User Dashboard (main interface)

**Frontend Components:**
- Create User
- Create Card
- Create Spending Profile
- User List
- Card List

## ⚡ Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start backend only
npm run server

# Start frontend only
cd frontend && npm start

# Install all dependencies
npm install && cd frontend && npm install && cd ..
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3002
```

**Database issues:**
```bash
# Delete and restart (recreates database)
rm database.sqlite
npm run dev
```

**Dependencies issues:**
```bash
# Clean and reinstall
rm -rf node_modules frontend/node_modules
npm install && cd frontend && npm install && cd ..
```

**For more troubleshooting, see:** [docs/SETUP.md](docs/SETUP.md#troubleshooting)

## 🌟 Key Concepts

### Multi-Tenant Architecture
Each business account has its own users and cards with data isolation.

### Role-Based Access Control (RBAC)
- **Owner** - Full control over account
- **Admin** - Manage users and cards
- **User** - Limited access
- **Analyst** - Read-only access

### Lithic Integration
- Every user → Lithic account holder
- Account → Lithic financial account
- Every card → Real Lithic card in sandbox
- Spending profiles → Lithic auth rules

### Spending Profiles
Reusable restriction templates that can be applied to multiple cards:
- Spending limits with durations (monthly/annually/forever)
- Merchant category controls (allowed/blocked)
- Enforced via Lithic auth rules

## 📊 Database Schema

The application uses 4 main tables:

- **accounts** - Business accounts
- **users** - All users with roles
- **cards** - All cards with limits
- **spending_profiles** - Custom restriction templates

All relationships are properly configured with foreign keys.

## 🔒 Security Notes

**Current Implementation (POC):**
- JWT authentication for API access
- Role-based authorization
- Email-only login (no passwords for users)
- Hardcoded admin credentials

**Production Recommendations:**
- Add password authentication
- Implement password hashing
- Use secure JWT secrets
- Add rate limiting
- Enable HTTPS/TLS
- Implement audit logging

## 🚀 Production Deployment

To prepare for production:

1. **Database:** Switch to PostgreSQL (configuration already supports it)
2. **Security:** Add password authentication and HTTPS
3. **Monitoring:** Add APM and error tracking
4. **Scaling:** Add caching layer (Redis) and load balancing
5. **Environment:** Use environment-specific configurations

## 📖 Additional Resources

- **[Lithic API Documentation](https://docs.lithic.com/)** - Official Lithic docs
- **[Sequelize Documentation](https://sequelize.org/)** - ORM documentation
- **[React Documentation](https://react.dev/)** - React documentation

## 💡 Future Enhancements

Ideas for extending this POC:

- Transaction history and monitoring
- Real-time webhooks for transaction notifications
- Card activation/deactivation
- Enhanced spending profile rules
- User password authentication
- Multi-factor authentication
- Dashboard analytics and charts
- Export/reporting features
- Mobile responsive design
- Unit and integration tests

## 🎯 Success Criteria

This POC demonstrates:

- ✅ Real Lithic API integration (sandbox)
- ✅ Complete admin CRM for onboarding
- ✅ Multiple login types (admin + user)
- ✅ Role-based access control
- ✅ Multiple card types
- ✅ Spending limits and profiles
- ✅ Full user and card management
- ✅ Clean, functional UI
- ✅ Production-ready patterns
- ✅ Scalable architecture

## 📞 Support

For help:

1. **Setup issues:** See [docs/SETUP.md](docs/SETUP.md)
2. **Testing questions:** See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
3. **Architecture questions:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. **Workflow questions:** See [docs/TODO.md](docs/TODO.md)

## 📝 License

This is a proof-of-concept project for demonstration purposes.

---

**Ready to start?** Run `npm run dev` and open http://localhost:3000

Built with ❤️ as a complete Lithic card issuing POC
