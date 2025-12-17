# Email Verification System - Flowchart

## Overview
This document describes the complete flow of email verification for both Client Auth and User Auth systems.

---

## 1. Client Registration with Email Verification Flow

```mermaid
flowchart TD
    A[Client Registration Request] --> B{Validate Input}
    B -->|Invalid| C[Return 400 Error]
    B -->|Valid| D{Email Exists?}
    D -->|Yes| E[Return 409 Conflict]
    D -->|No| F[Hash Password]
    F --> G[Create Client Record]
    G --> H[Set is_email_verified = false]
    H --> I[Generate Verification Token]
    I --> J[Save Token to DB]
    J --> K[Get SMTP Config for Client]
    K --> L{SMTP Config Exists?}
    L -->|No| M[Use Default SMTP Config]
    L -->|Yes| N[Use Client SMTP Config]
    M --> O[Send Verification Email]
    N --> O
    O --> P{Email Sent?}
    P -->|Success| Q[Return 201 Success]
    P -->|Failed| R[Log Error, Return 201 with Warning]
    Q --> S[Client Receives Email]
    S --> T[Click Verification Link]
    T --> U[Verify Token Endpoint]
```

---

## 2. Service User Registration with Email Verification Flow

```mermaid
flowchart TD
    A[User Registration Request<br/>with Access Key] --> B[Validate Access Key]
    B -->|Invalid| C[Return 401 Unauthorized]
    B -->|Valid| D[Extract client_id]
    D --> E{Validate Input}
    E -->|Invalid| F[Return 400 Error]
    E -->|Valid| G{User Email Exists?}
    G -->|Yes| H[Return 409 Conflict]
    G -->|No| I[Hash Password]
    I --> J[Create User in users_clientId Collection]
    J --> K[Set is_email_verified = false]
    K --> L[Generate Verification Token]
    L --> M[Save Token to DB with client_id]
    M --> N[Get SMTP Config for Client]
    N --> O{SMTP Config Exists?}
    O -->|No| P[Use Default SMTP Config]
    O -->|Yes| Q[Use Client SMTP Config]
    P --> R[Send Verification Email]
    Q --> R
    R --> S{Email Sent?}
    S -->|Success| T[Return 201 Success]
    S -->|Failed| U[Log Error, Return 201 with Warning]
    T --> V[User Receives Email]
    V --> W[Click Verification Link]
    W --> X[Verify Token Endpoint]
```

---

## 3. Email Verification Process Flow

```mermaid
flowchart TD
    A[User Clicks Verification Link] --> B[Extract Token from URL]
    B --> C[Verify Token Endpoint]
    C --> D{Token Valid?}
    D -->|Invalid/Expired| E[Return 400 Error]
    D -->|Valid| F{Token Already Used?}
    F -->|Yes| G[Return 400 Already Verified]
    F -->|No| H[Get User/Client Record]
    H --> I{User Type?}
    I -->|Client| J[Update Client is_email_verified = true]
    I -->|Service User| K[Update User is_email_verified = true]
    J --> L[Mark Token as Verified]
    K --> L
    L --> M[Set verified_at timestamp]
    M --> N[Return 200 Success]
    N --> O[User Can Now Login]
```

---

## 4. Login Flow with Email Verification Check

```mermaid
flowchart TD
    A[Login Request] --> B[Validate Credentials]
    B -->|Invalid| C[Return 401 Unauthorized]
    B -->|Valid| D{Email Verified?}
    D -->|No| E[Return 401 Email Not Verified]
    D -->|Yes| F[Generate Access Token]
    F --> G[Generate Refresh Token]
    G --> H[Store Refresh Token Hash]
    H --> I[Return 200 with Tokens]
    I --> J[User Authenticated]
```

---

## 5. SMTP Provider Selection Flow

```mermaid
flowchart TD
    A[Send Verification Email Request] --> B[Get client_id]
    B --> C[Query SMTP Configuration]
    C --> D{SMTP Config Found?}
    D -->|No| E[Use Default System SMTP]
    D -->|Yes| F{Provider Type?}
    F -->|Gmail| G[Use Gmail OAuth2 Config]
    F -->|SendGrid| H[Use SendGrid API Key]
    F -->|AWS SES| I[Use AWS SES SDK]
    F -->|Custom SMTP| J[Use Custom SMTP Config]
    G --> K[Create Nodemailer Transporter]
    H --> K
    I --> K
    J --> K
    E --> K
    K --> L[Send Email with Template]
    L --> M{Email Sent?}
    M -->|Success| N[Log Success]
    M -->|Failed| O[Log Error]
    N --> P[Return Success]
    O --> Q[Return Error/Warning]
```

---

## 6. Complete Registration to Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant AuthService
    participant EmailService
    participant SMTP
    participant DB
    participant EmailProvider

    User->>API: POST /register
    API->>AuthService: registerUser()
    AuthService->>DB: Check if exists
    AuthService->>DB: Create user/client
    AuthService->>EmailService: generateVerificationToken()
    EmailService->>DB: Save token
    AuthService->>EmailService: sendVerificationEmail()
    EmailService->>DB: Get SMTP config
    EmailService->>SMTP: Select provider
    SMTP->>EmailProvider: Send email
    EmailProvider->>User: Verification email
    API->>User: 201 Created
    
    User->>EmailProvider: Click link
    User->>API: GET /verify-email?token=xxx
    API->>EmailService: verifyEmailToken()
    EmailService->>DB: Validate token
    EmailService->>DB: Update is_email_verified
    API->>User: 200 Verified
    
    User->>API: POST /login
    API->>AuthService: loginUser()
    AuthService->>DB: Check credentials
    AuthService->>DB: Check is_email_verified
    AuthService->>API: Generate tokens
    API->>User: 200 Success with tokens
```

---

## 7. Resend Verification Email Flow

```mermaid
flowchart TD
    A[Resend Verification Request] --> B[Validate User/Client]
    B -->|Not Found| C[Return 404 Error]
    B -->|Found| D{Already Verified?}
    D -->|Yes| E[Return 400 Already Verified]
    D -->|No| F[Revoke Old Tokens]
    F --> G[Generate New Token]
    G --> H[Save New Token]
    H --> I[Get SMTP Config]
    I --> J[Send Verification Email]
    J --> K{Email Sent?}
    K -->|Success| L[Return 200 Success]
    K -->|Failed| M[Return 500 Error]
```

---

## Key Components

### Database Collections
- **email_verification_tokens**: Stores verification tokens
- **smtp_configurations**: Stores SMTP settings per client
- **clients**: Updated with `is_email_verified` field
- **users_<clientId>**: Updated with `is_email_verified` field

### Services
- **emailVerificationService**: Handles token generation and verification
- **emailService**: Handles email sending via multiple providers
- **authService**: Updated to send verification emails
- **userService**: Updated to send verification emails

### Endpoints
- `POST /api/v1/client/auth/verify-email` - Verify client email
- `POST /api/v1/client/auth/resend-verification` - Resend client verification
- `POST /api/v1/service/auth/verify-email` - Verify user email
- `POST /api/v1/service/auth/resend-verification` - Resend user verification

---

## Security Considerations

1. **Token Expiry**: Verification tokens expire after 24 hours
2. **One-Time Use**: Tokens are marked as used after verification
3. **Rate Limiting**: Resend verification limited to 3 requests per hour
4. **Token Hashing**: Tokens are hashed before storage
5. **SMTP Credentials**: Encrypted in database
6. **Email Validation**: Email format validated before sending
```

Should I save this as a file, or would you prefer a different format? The Mermaid diagrams render in most markdown viewers (GitHub, GitLab, VS Code with extensions, etc.).
