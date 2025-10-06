# Lithic POC - Card Issuing Platform

A complete proof-of-concept demonstrating card issuing capabilities using Lithic's sandbox API. This project showcases a full-stack fintech application with user management, card provisioning, and spending controls.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install && cd frontend && npm install && cd ..

# Start the application
npm run dev
```

**Then open:** http://localhost:3000

---

## 📚 Documentation

### Getting Started
- **[WORKFLOW.md](WORKFLOW.md)** - Step-by-step testing workflow (start here!)

### Technical Documentation
- **[docs/FEATURES.md](docs/FEATURES.md)** - Feature descriptions and capabilities
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and design
- **[docs/API.md](docs/API.md)** - Complete API reference
- **[docs/LITHIC_INTEGRATION.md](docs/LITHIC_INTEGRATION.md)** - Lithic API integration details

---

## ✨ Key Features

- ✅ **Admin CRM** - Business account onboarding
- ✅ **User Management** - Role-based access (Owner, Admin, User, Analyst)
- ✅ **Card Issuing** - Debit and reloadable cards via Lithic API
- ✅ **Spending Profiles** - Reusable restriction templates
- ✅ **Real-time Integration** - Actual Lithic sandbox API (not mocked)

---

## 🎯 What This POC Demonstrates

### Complete Workflow

1. **Admin** creates business account
2. **Owner** manages users and cards
3. **Users** receive cards with spending limits
4. **Spending profiles** control merchant restrictions

### Technologies Used

- **Backend:** Node.js + Express + Sequelize
- **Frontend:** React + React Router
- **Database:** SQLite (PostgreSQL-ready)
- **API Integration:** Lithic Sandbox
- **Authentication:** JWT

---

## 🔑 Login Credentials

### Admin CRM
- Username: `admin`
- Password: `admin@123`

### Users
- Email-only login (no password for POC)
- Example: `eric@msdcafe.com`

---

## 📋 Testing the Complete Flow

Follow the [WORKFLOW.md](WORKFLOW.md) document for the complete testing workflow. The workflow demonstrates:

1. Admin creates account with owner
2. Owner creates users (Seth, Gabriel, Nathalia, Lindsey)
3. Owner creates debit cards
4. Admin creates reloadable cards
5. Admin creates spending profiles
6. Admin attaches profiles to cards
7. View all users and cards

**Estimated time:** 10-15 minutes

---

## 🏗️ Project Structure

```
lithic-poc/
├── backend/              # Express API server
│   ├── config/          # Lithic API client
│   ├── middleware/      # Authentication
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   └── server.js        # Entry point
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main app
│   └── package.json
├── docs/                # Documentation
│   ├── ARCHITECTURE.md  # Technical architecture
│   ├── FEATURES.md      # Feature descriptions
│   ├── API.md           # API reference
│   └── LITHIC_INTEGRATION.md # Lithic integration
├── WORKFLOW.md          # Testing workflow
├── .env                 # Environment variables
└── package.json         # Dependencies
```

---

## 🔧 Configuration

### Environment Variables

Create or edit `.env` file:

```env
# Server
PORT=3001

# Database (SQLite by default)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Authentication
JWT_SECRET=your-super-secret-jwt-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@123

# Lithic API
LITHIC_API_KEY=your_sandbox_api_key
LITHIC_BASE_URL=https://sandbox.lithic.com/v1
```

### Using PostgreSQL

To switch to PostgreSQL:

1. Update `.env`:
   ```env
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lithic_poc
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

2. Install PostgreSQL:
   ```bash
   npm install pg pg-hstore
   ```

3. Start PostgreSQL (or use Docker):
   ```bash
   docker-compose up -d
   ```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
npm install
npm run server
```

### Frontend won't start
```bash
cd frontend
npm install
npm start
```

### Database issues
```bash
# Reset database
rm database.sqlite
npm run dev
```

### Port conflicts
Edit `.env` and change `PORT=3001` to another port.

---

## 📖 Documentation Overview

### For Users
- **[WORKFLOW.md](WORKFLOW.md)** - How to test the complete system

### For Developers
- **[docs/FEATURES.md](docs/FEATURES.md)** - What each feature does
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - How the system is built
- **[docs/API.md](docs/API.md)** - How to use the API
- **[docs/LITHIC_INTEGRATION.md](docs/LITHIC_INTEGRATION.md)** - How Lithic integration works

---

## 🚀 Development

### Run Backend Only
```bash
npm run server
```

### Run Frontend Only
```bash
cd frontend
npm start
```

### Run Both (Development)
```bash
npm run dev
```

---

## 🎓 Learning Resources

This POC demonstrates:

- Full-stack JavaScript development
- RESTful API design
- React component architecture
- Database modeling with Sequelize
- JWT authentication
- External API integration (Lithic)
- Role-based access control
- Error handling patterns

---

## 🔐 Security Notes

### Current (POC)
- Email-only login (no password for users)
- Simple JWT authentication
- Development CORS policy

### Production Requirements
- Add password authentication
- Implement MFA (multi-factor auth)
- Secure CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

---

## 📊 Future Enhancements

Features not included in this POC:

- Transaction history
- Real-time webhooks
- Card activation/deactivation
- Enhanced analytics
- Mobile responsive design
- Password authentication
- Multi-factor authentication
- Receipt capture
- Budget management
- Approval workflows

---

## 🤝 Contributing

This is a proof-of-concept project for learning and demonstration purposes.

---

## 📄 License

This project is for demonstration purposes only.

---

## 🆘 Support

For questions or issues:

1. Check the [WORKFLOW.md](WORKFLOW.md) for testing steps
2. Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
3. See [docs/API.md](docs/API.md) for API documentation
4. Check `.env` configuration

---

**Built with ❤️ as a proof-of-concept for Lithic card issuing integration**

**Ready to start?** → [Follow the workflow](WORKFLOW.md)
