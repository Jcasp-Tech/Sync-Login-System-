# Phase 1 Authentication Service - Recommended Packages

This file lists the recommended NPM packages for building Phase 1 of the Secure Authentication Service.

---

## Core Packages

| Package | Purpose | Notes |
|---------|---------|-------|
| `express` | Core web framework for Node.js | Routing, middleware, lightweight |
| `jsonwebtoken` | Create & verify JWT tokens | Stateless authentication |
| `express-jwt` | JWT middleware for Express | Optional convenience |
| `bcrypt` | Password hashing (native) | Recommended for production |
| `bcryptjs` | Pure JS password hashing | Alternative if native build fails |
| `express-validator` | Request input validation | Emails, passwords, etc. |
| `express-rate-limit` | Rate limiting | Protect login/register endpoints |
| `helmet` | HTTP headers security | Protect against common vulnerabilities |
| `dotenv` | Load environment variables | Store secrets outside code |
| `cors` | Enable Cross-Origin Resource Sharing | Secure API access |
| `mongoose` | MongoDB object modeling | ODM for MongoDB, schema validation |
| `uuid` | Generate UUIDs | For database model IDs (if using UUID instead of ObjectId) |

---

## Optional / Phase 1 Extras

| Package | Purpose | Notes |
|---------|---------|-------|
| `nodemailer` | Send emails | Email verification, notifications |
| `nodemon` | Development auto-reload | Dev-only convenience |
| `jest` | Testing framework | Unit tests |
| `supertest` | Integration tests | API testing |

---

## Install Commands

### Core Dependencies
```bash
npm install express jsonwebtoken bcrypt express-validator express-rate-limit helmet dotenv cors mongoose uuid
```

### Optional Dependencies
```bash
npm install --save-dev nodemon jest supertest
npm install nodemailer
```

---

## Notes

- **UUID Package**: Use `uuid` if you need UUID strings for database model IDs instead of MongoDB's default ObjectId. Install with `npm install uuid`.
- **Mongoose**: Required for MongoDB connection and schema modeling. Install with `npm install mongoose`.
