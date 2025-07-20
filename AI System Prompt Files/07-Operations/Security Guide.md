# Security Best Practices Guide

> Implementation guide for the Assistant: How to build secure features that protect user data and prevent common attacks. Apply these patterns consistently across all code.

---

## Overview

Security must be built into every feature from the start. Focus on authentication, input validation, data protection, and secure communication to prevent data breaches and unauthorized access.

---

## Authentication & Authorization

Verify user identity and permissions on every request:

- **Validate Firebase tokens** on all API endpoints before processing
- **Check workspace ownership** before allowing access to pages/blocks
- **Never trust client-side auth checks** - always verify server-side
- **Use short-lived tokens** and refresh them regularly

Store minimal user data and never cache sensitive auth information.

---

## Input Validation & Sanitization

Treat all user input as potentially malicious:

- **Validate data types** and formats before processing
- **Sanitize HTML content** to prevent XSS attacks
- **Check string lengths** and reject oversized inputs
- **Whitelist allowed characters** for special fields (IDs, usernames)
- **Validate file uploads** if implemented (size, type, content)

Validate on both frontend (UX) and backend (security). Backend validation is mandatory.

---

## API Security

Protect API endpoints from abuse:

- **Rate limiting**: Limit requests per user/IP to prevent abuse
- **CORS configuration**: Restrict origins that can access API
- **HTTPS only**: Never transmit sensitive data over HTTP
- **No sensitive data in URLs**: Use request bodies for confidential information
- **Proper HTTP methods**: Use POST/PUT for data changes, GET for reads only

Log authentication failures and unusual access patterns.

---

## Data Protection

Handle user data responsibly:

- **Encrypt sensitive data** at rest in database
- **Use environment variables** for secrets and API keys
- **Never log passwords** or tokens in application logs
- **Implement data retention policies** for deleted content
- **Secure database connections** with proper credentials

Follow data minimization - only collect and store necessary information.

---

## Content Security

Protect against malicious content:

- **Sanitize rich text** content to prevent script injection
- **Validate block types** and content formats
- **Escape user content** when rendering in HTML
- **Limit file upload types** and scan for malware if applicable

Use content security policies (CSP) to prevent unauthorized script execution.

---

## Session Management

Handle user sessions securely:

- **Secure session storage** - use httpOnly cookies when possible
- **Session timeout** after inactivity periods
- **Invalidate sessions** on logout and password changes
- **Detect concurrent sessions** and handle appropriately

Never store session data in localStorage without encryption.

---

## Error Handling Security

Prevent information leakage through errors:

- **Generic error messages** for authentication failures
- **No stack traces** or internal details in API responses
- **Log detailed errors** server-side for debugging
- **Rate limit error responses** to prevent enumeration attacks

Don't reveal whether users/emails exist in the system through error messages.

---

## Environment & Deployment Security

Secure the deployment environment:

- **Environment separation**: Different secrets for dev/staging/prod
- **Secret rotation**: Regular API key and database password updates
- **Dependency scanning**: Monitor for vulnerable packages
- **Security headers**: HSTS, X-Frame-Options, X-Content-Type-Options

Keep dependencies updated and scan for known vulnerabilities.

---

## Implementation Requirements

**Every API endpoint must**:

- Validate authentication token
- Check user permissions for requested resources
- Sanitize and validate all inputs
- Use rate limiting and proper HTTP methods

**Every form input must**:

- Validate data format and length
- Sanitize content before storage
- Handle validation errors gracefully
- Prevent submission of invalid data

**Every user-generated content must**:

- Be sanitized before storage and display
- Follow content security policies
- Limit allowed formats and sizes
- Be escaped when rendered in HTML

**All secrets and credentials must**:

- Be stored in environment variables
- Never appear in code or logs
- Be rotated regularly
- Use different values per environment
