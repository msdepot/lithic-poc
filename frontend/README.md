# Lithic Admin Frontend

A React TypeScript frontend for the Lithic Payment Card Management POC. This application provides a comprehensive admin interface to replace Postman testing with a user-friendly web interface.

## Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control (RBAC)
- Secure API integration

### 👥 User Management
- Create and manage system users
- Assign roles (Super Admin, Admin, User, Analyst)
- View user details and activity status

### 🏢 Account Management
- Create business and personal accounts
- Link accounts to users
- Manage account types and balances

### 💳 Card Management
- Issue different card types (Credit, Debit, Prepaid, Virtual)
- Real Lithic API integration
- Card status management (Active, Locked, Pending)
- Visual card representations

### 🛡️ Spending Profiles
- Create spending limits and rules
- Set daily, monthly, and per-transaction limits
- Configure geographic and merchant restrictions
- Real-time authorization rule integration

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Styled Components (Greyscale theme)
- **State Management**: React Query for server state
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on localhost:3000

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
# Start development server
npm start

# The app will open on http://localhost:3001
```

### Environment Variables
Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:3000/api
```

## Default Credentials
- **Username**: admin
- **Password**: admin123

## UI Design Philosophy

### Greyscale Theme
- Clean, professional appearance suitable for fintech
- High contrast for accessibility
- Minimalist design focused on functionality

### Navigation
- Fixed left sidebar with clear sections
- Breadcrumb navigation
- Contextual actions and buttons

### Responsive Design
- Mobile-friendly layouts
- Flexible grid systems
- Accessible form controls

## API Integration

The frontend integrates with all backend endpoints:

### Authentication (`/api/auth`)
- Login/logout
- Token refresh
- Profile management

### Users (`/api/users`)
- Create users with role assignment
- List and filter users
- User profile management

### Accounts (`/api/accounts`)
- Create business/personal accounts
- Link to account holders
- Account balance management

### Cards (`/api/cards`)
- Card creation with Lithic integration
- Status management (lock/unlock)
- Card details and limits

### Spending Profiles (`/api/spending-profiles`)
- Create authorization rules
- Set spending limits
- Geographic restrictions

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Configuration
- Update `REACT_APP_API_URL` for production API
- Configure proper CORS settings
- Set up SSL/HTTPS

### Security Considerations
- JWT tokens stored securely in localStorage
- Automatic token refresh handling
- API request/response interceptors
- RBAC enforcement on frontend routes

## Testing the POC

This frontend replaces the Postman collection testing workflow:

### Phase 1: Foundation
1. Login as admin
2. Create Eric Medina (Super Admin) as account owner
3. Create MSD Cafe business account

### Phase 2: User Hierarchy  
1. Create family members with appropriate roles
2. Test role-based permissions
3. Verify user management workflow

### Phase 3: Card Operations
1. Issue cards for different users
2. Test Lithic API integration
3. Manage card statuses and limits

### Phase 4: Spending Controls
1. Create spending profiles
2. Apply authorization rules
3. Test limit enforcement

## Development Notes

### Code Organization
```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── pages/         # Main application pages
├── services/      # API integration
└── types/         # TypeScript definitions
```

### Styling Conventions
- Styled Components for all styling
- Consistent spacing and typography
- Greyscale color palette
- Hover and focus states for interactions

### State Management
- React Query for server state
- React Context for authentication
- Local component state for UI state

## Troubleshooting

### Common Issues
1. **API Connection**: Verify backend is running on port 3000
2. **CORS Errors**: Check backend CORS configuration
3. **Authentication**: Clear localStorage and re-login
4. **Missing Data**: Ensure database is seeded properly

### Debug Mode
Enable React DevTools and Network tab for debugging API calls.