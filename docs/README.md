# Documentation Index

Welcome to the Lithic POC documentation! This folder contains all technical documentation for the project.

## 📚 Documentation Overview

### For Getting Started
- **[../WORKFLOW.md](../WORKFLOW.md)** - Step-by-step testing workflow (start here!)
- **[../README.md](../README.md)** - Project overview and quick start

### Feature Documentation
- **[FEATURES.md](FEATURES.md)** - Complete feature descriptions
  - What each feature does
  - How to use each feature
  - User roles and permissions
  - Spending profiles explained

### Technical Documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
  - Technology stack
  - Database schema
  - Security architecture
  - Scalability considerations

- **[database/](database/)** - Database schema documentation
  - Complete schema overview with ERD
  - Detailed table documentation
  - Primary keys and indexes
  - Foreign key relationships
  - Schema improvement recommendations

- **[API.md](API.md)** - API reference
  - All endpoints documented
  - Request/response examples
  - Error codes
  - Authentication details

- **[LITHIC_INTEGRATION.md](LITHIC_INTEGRATION.md)** - Lithic integration
  - How we integrate with Lithic
  - Account holder creation
  - Card provisioning
  - Auth rules (spending profiles)
  - Sandbox vs production

---

## 🎯 Quick Navigation

### I want to...

**Test the application**
→ [../WORKFLOW.md](../WORKFLOW.md)

**Understand what features exist**
→ [FEATURES.md](FEATURES.md)

**Learn how it's built**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

**Understand the database schema**
→ [database/](database/)

**Use the API**
→ [API.md](API.md)

**Understand Lithic integration**
→ [LITHIC_INTEGRATION.md](LITHIC_INTEGRATION.md)

---

## 📖 Reading Order

### For New Users
1. [../README.md](../README.md) - Project overview
2. [../WORKFLOW.md](../WORKFLOW.md) - Test the complete flow
3. [FEATURES.md](FEATURES.md) - Understand what's possible

### For Developers
1. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the system design
2. [database/](database/) - Deep dive into database schema
3. [API.md](API.md) - Learn the API endpoints
4. [LITHIC_INTEGRATION.md](LITHIC_INTEGRATION.md) - Understand external integration
5. [FEATURES.md](FEATURES.md) - Understand feature implementation

### For Integrators
1. [API.md](API.md) - API reference
2. [LITHIC_INTEGRATION.md](LITHIC_INTEGRATION.md) - Lithic-specific details
3. [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

## 🔍 Documentation Structure

```
lithic-poc/
├── README.md           # Main project overview
├── WORKFLOW.md         # Step-by-step testing workflow
└── docs/              # Detailed documentation
    ├── README.md      # This file
    ├── FEATURES.md    # Feature descriptions
    ├── ARCHITECTURE.md # Technical architecture
    ├── database/      # Database schema documentation
    │   ├── README.md           # Database docs index
    │   ├── SCHEMA_OVERVIEW.md  # Schema overview with ERD
    │   ├── TABLES.md           # Detailed table documentation
    │   ├── RELATIONSHIPS.md    # Foreign keys and relationships
    │   └── RECOMMENDATIONS.md  # Schema improvement recommendations
    ├── API.md         # API reference
    └── LITHIC_INTEGRATION.md # Lithic integration
```

---

## 📝 Documentation Standards

All documentation in this folder follows these standards:

- **Clear Structure:** Table of contents, sections, subsections
- **Code Examples:** Real, working code samples
- **Visual Aids:** Diagrams, tables, formatted examples
- **Cross-References:** Links to related documentation
- **Up-to-Date:** Last updated date included

---

## 🔄 Documentation Updates

**Last Updated:** 2025-10-06

When updating documentation:
1. Update the content
2. Update the "Last Updated" date
3. Update cross-references if needed
4. Ensure examples still work

---

## 🤝 Contributing to Documentation

When adding new features:
1. Update [FEATURES.md](FEATURES.md) with feature description
2. Update [API.md](API.md) if new endpoints added
3. Update [ARCHITECTURE.md](ARCHITECTURE.md) if architecture changed
4. Update [WORKFLOW.md](../WORKFLOW.md) if testing steps changed

---

**Questions?** Check the specific documentation file for your topic!
