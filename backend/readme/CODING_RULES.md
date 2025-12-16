# Coding Rules & Best Practices 

## Folder Structure

auth-service/
│
├── src/
│ ├── config/
│ ├── controllers/
│ ├── services/
│ ├── models/
│ ├── middlewares/
│ ├── routes/
│ ├── utils/
│ └── app.js
├── tests/
├── scripts/
├── .env
├── package.json
├── README.md
└── .gitignore



- Controllers: HTTP request handling
- Services: Business logic only
- Models: Database schemas / ORM
- Middlewares: Auth, rate-limit, error handler
- Utils: Generic helper functions
- Tests: Unit & integration

---

## General Coding Rules
- Use modular architecture: `controllers → services → models`
- Functions <50 lines where possible
- Use async/await for all async calls
- Handle all errors; return proper HTTP status codes
- Do not log sensitive data (passwords, tokens, secrets)

---

## Security Rules
- Hash passwords (Argon2id / bcrypt)
- Store refresh tokens hashed
- Validate all inputs (email, password)
- Rate-limit login/register endpoints
- Use HTTPS only
- Store secrets in environment variables

---

## Testing Rules
- Unit test all services
- Integration test all routes
- Mock database for tests
- Test rate limits and token expiry

---

## Git / Commit Rules
- Use feature branches
- Commit messages: `feat: add login endpoint`, `fix: hash password bug`
- Run lint & tests before merge

---

## Naming Rules

### Files
- JS files: camelCase: `authService.js`, `userModel.js`
- Classes: PascalCase: `class User {}`
- Controllers: `*Controller.js`
- Services: `*Service.js`
- Models: `*Model.js`
- Middlewares: `*Middleware.js`

### Variables
- camelCase: `accessToken`, `refreshToken`
- Constants: UPPER_CASE: `JWT_SECRET`, `TOKEN_EXPIRY`

### Functions
- Descriptive verb+noun: `createUser`, `validatePassword`, `generateJWT`

### Database
- Tables: plural snake_case: `users`, `tokens`, `audit_logs`
- Columns: snake_case

---

## General Guidelines
- Use `.env` for secrets; never commit secrets to git
- Centralized error middleware; return JSON: `{ success, message, code }`
- Logging via utility (winston/pino)
- Rate-limit login/register endpoints
- Document API endpoints with example requests/responses
- Follow the pattern: `controller → service → model → route → test`
