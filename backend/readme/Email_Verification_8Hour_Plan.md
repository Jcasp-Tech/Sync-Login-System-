# Email Verification Module - 8 Hour Implementation Plan

## Research & Planning (1 hour)
- Research SMTP providers (Gmail, SendGrid, AWS SES, Custom SMTP)
- Study Nodemailer documentation and AWS SES SDK
- Design database schemas for email verification tokens and SMTP configurations
- Plan integration points with existing Client Auth and User Auth flows

## Setup & Dependencies (30 minutes)
- Install nodemailer and @aws-sdk/client-sesv2 packages
- Update package.json and verify dependencies
- Add environment variables for email configuration

## Database Models (1 hour)
- Create emailVerificationTokenModel.js with schema (user_id, client_id, token, expires_at, verified_at)
- Create smtpConfigurationModel.js with schema (client_id, provider, credentials, from_email)
- Add models to models/index.js
- Test model creation and validation

## Email Service (2 hours)
- Create emailService.js with multi-provider support (Gmail, SendGrid, SES, Custom SMTP)
- Implement provider selection logic based on client configuration
- Create email template for verification emails
- Add error handling and logging

## Verification Service (1.5 hours)
- Create emailVerificationService.js with business logic
- Implement generateVerificationToken function
- Implement verifyEmailToken function
- Implement sendVerificationEmail function
- Update user/client is_email_verified status

## Controllers & Routes (1 hour)
- Create emailVerificationController.js with send and verify endpoints
- Add routes to authRoutes.js for Client Auth verification
- Add routes to serviceAuthRoutes.js for User Auth verification
- Add validation middleware for verification endpoints

## Integration (1 hour)
- Update authService.js to send verification email after client registration
- Update userService.js to send verification email after user registration
- Update login flows to check email verification status
- Add rate limiting for verification endpoints

## Testing & Documentation (30 minutes)
- Test email sending with different providers
- Test verification token generation and validation
- Test integration with registration and login flows
- Update API documentation with new endpoints
