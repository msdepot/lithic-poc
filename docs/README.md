# Documentation Index

Welcome to the Lithic POC documentation! This folder contains comprehensive guides to help you understand, set up, and use the application.

## 📚 Documentation Overview

The documentation is organized into four focused guides, each serving a specific purpose:

### 1. [SETUP.md](SETUP.md) - Installation & Configuration
**Start here if you need to install and run the application.**

This guide covers:
- Prerequisites and dependencies
- Installation steps (backend and frontend)
- Database configuration (SQLite, PostgreSQL, Supabase)
- Environment variables
- Troubleshooting common setup issues
- Development commands

**When to use:** First-time setup, deployment, or troubleshooting installation issues.

---

### 2. [TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete Testing Instructions
**Start here if you want to test the application.**

This guide covers:
- Complete step-by-step testing workflow
- Each phase explained in detail
- Expected results for each step
- Test validation checklist
- Additional test scenarios for different user roles
- Troubleshooting test issues

**When to use:** Testing the application, verifying features work correctly, or demonstrating the POC.

---

### 3. [TODO.md](TODO.md) - Workflow Steps
**Start here to understand the complete workflow.**

This guide covers:
- The 9-step workflow from the Linear issue
- What each step accomplishes
- Behind-the-scenes details
- Success criteria for each step
- Workflow validation checklist

**When to use:** Understanding the business workflow, following the Linear issue requirements, or running through the complete demo.

---

### 4. [ARCHITECTURE.md](ARCHITECTURE.md) - Technical Documentation
**Start here to understand how the system works.**

This guide covers:
- System architecture and components
- Frontend structure (React)
- Backend structure (Node.js + Express)
- Database schema and models
- Lithic API integration points
- Authentication and authorization
- Data flow examples
- Technology stack
- Security considerations
- Scalability and extension points

**When to use:** Understanding the codebase, extending features, or reviewing technical design decisions.

---

## 🗺️ Quick Navigation Guide

**I want to...**

- **Get started quickly** → [SETUP.md](SETUP.md)
- **Test the application** → [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Understand the workflow** → [TODO.md](TODO.md)
- **Learn how it works** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Overview of the project** → [../README.md](../README.md)

---

## 📖 Documentation Structure

```
docs/
├── README.md              ← You are here (documentation index)
├── SETUP.md              ← Installation and configuration
├── TESTING_GUIDE.md      ← Step-by-step testing instructions
├── TODO.md               ← 9-step workflow from Linear issue
└── ARCHITECTURE.md       ← Technical architecture and design
```

---

## 🎯 Key Concepts

These concepts are explained in detail throughout the documentation:

### Multi-Tenant Architecture
Each business account has its own isolated set of users and cards.

### Role-Based Access Control (RBAC)
Four user roles with different permission levels:
- **Owner** - Full control
- **Admin** - User and card management
- **User** - Limited access
- **Analyst** - Read-only

### Lithic Integration
Real integration with Lithic's sandbox API:
- Account holder creation
- Financial account management
- Card creation
- Auth rules (spending profiles)

### Spending Profiles
Reusable restriction templates that can be applied to multiple cards, enforcing:
- Spending limits
- Merchant category controls
- Duration-based limits

---

## 🔍 Finding Specific Information

### Setup & Installation
- Prerequisites → [SETUP.md - Prerequisites](SETUP.md#prerequisites)
- Quick start → [SETUP.md - Quick Start](SETUP.md#quick-start)
- Database setup → [SETUP.md - Database Setup](SETUP.md#database-setup)
- Troubleshooting → [SETUP.md - Troubleshooting](SETUP.md#troubleshooting)

### Testing
- Complete test flow → [TESTING_GUIDE.md - Complete Test Flow](TESTING_GUIDE.md#complete-test-flow)
- Test validation → [TESTING_GUIDE.md - Test Validation Checklist](TESTING_GUIDE.md#test-validation-checklist)
- Test different roles → [TESTING_GUIDE.md - Additional Test Scenarios](TESTING_GUIDE.md#additional-test-scenarios)

### Workflow
- 9-step workflow → [TODO.md - Step-by-Step Workflow](TODO.md#step-by-step-workflow)
- Workflow validation → [TODO.md - Workflow Validation Checklist](TODO.md#workflow-validation-checklist)
- What was accomplished → [TODO.md - Summary](TODO.md#summary)

### Architecture
- System overview → [ARCHITECTURE.md - System Architecture](ARCHITECTURE.md#system-architecture)
- Frontend components → [ARCHITECTURE.md - Frontend](ARCHITECTURE.md#1-frontend-react-application)
- Backend routes → [ARCHITECTURE.md - Backend](ARCHITECTURE.md#2-backend-nodejs--express)
- Database schema → [ARCHITECTURE.md - Database Layer](ARCHITECTURE.md#3-database-layer)
- Lithic integration → [ARCHITECTURE.md - Lithic Integration](ARCHITECTURE.md#4-lithic-integration)
- Security → [ARCHITECTURE.md - Security Considerations](ARCHITECTURE.md#security-considerations)

---

## 📋 Suggested Reading Order

### For New Users
1. [../README.md](../README.md) - Project overview
2. [SETUP.md](SETUP.md) - Get it running
3. [TESTING_GUIDE.md](TESTING_GUIDE.md) - Test it out
4. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand how it works

### For Developers
1. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the design
2. [SETUP.md](SETUP.md) - Set up development environment
3. [TODO.md](TODO.md) - Understand the workflow
4. [TESTING_GUIDE.md](TESTING_GUIDE.md) - Test your changes

### For Stakeholders
1. [../README.md](../README.md) - High-level overview
2. [TODO.md](TODO.md) - Business workflow
3. [TESTING_GUIDE.md](TESTING_GUIDE.md) - How to demo

---

## 🎓 Learning Path

**Level 1: Getting Started**
- Read project README
- Run quick start commands
- Test the basic flow

**Level 2: Understanding Features**
- Review complete workflow (TODO.md)
- Test all 9 steps
- Explore different user roles

**Level 3: Technical Deep Dive**
- Study architecture documentation
- Review backend code
- Understand Lithic integration

**Level 4: Extending**
- Review extension points
- Add new features
- Contribute improvements

---

## 💡 Tips for Using This Documentation

1. **Start with the README** - Always start with the main README.md for overview
2. **Use search** - Use Ctrl+F (Cmd+F) to find specific topics
3. **Follow links** - Documentation is cross-referenced with links
4. **Check troubleshooting** - Most common issues are documented
5. **Refer to examples** - Code examples and data flow diagrams are included

---

## 🔄 Documentation Updates

This documentation reflects the current state of the Lithic POC project. The documentation is organized to:

- **Separate concerns** - Each guide focuses on one aspect
- **Avoid redundancy** - Information appears in one primary location
- **Provide clear navigation** - Easy to find what you need
- **Include examples** - Concrete examples throughout
- **Be actionable** - Step-by-step instructions where needed

---

## 📞 Getting Help

If you can't find what you're looking for:

1. **Check the main README** - [../README.md](../README.md)
2. **Search all docs** - Use your editor's search across files
3. **Review troubleshooting** - Check SETUP.md and TESTING_GUIDE.md troubleshooting sections
4. **Check the code** - Backend and frontend code is well-commented

---

## 🎯 Quick Reference

| I need to... | Go to... |
|-------------|----------|
| Install the app | [SETUP.md](SETUP.md) |
| Test the app | [TESTING_GUIDE.md](TESTING_GUIDE.md) |
| Understand the workflow | [TODO.md](TODO.md) |
| Learn the architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Fix setup issues | [SETUP.md - Troubleshooting](SETUP.md#troubleshooting) |
| Fix test issues | [TESTING_GUIDE.md - Troubleshooting](TESTING_GUIDE.md#troubleshooting-test-issues) |
| Understand database | [ARCHITECTURE.md - Database](ARCHITECTURE.md#3-database-layer) |
| Understand Lithic API | [ARCHITECTURE.md - Lithic Integration](ARCHITECTURE.md#4-lithic-integration) |
| Learn about roles | [ARCHITECTURE.md - Authorization](ARCHITECTURE.md#authorization-role-based-access-control) |
| See data flow | [ARCHITECTURE.md - Data Flow Examples](ARCHITECTURE.md#data-flow-examples) |

---

**Ready to get started?** Head to [SETUP.md](SETUP.md) to install and run the application!
