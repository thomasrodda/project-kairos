# API Security Configuration

This document outlines the security measures implemented in the Project Kairos API.

## Security Features

### 1. Security Headers (Helmet.js)

- **Content Security Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **X-Frame-Options**: Prevents clickjacking (set to DENY)
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 2. Rate Limiting

Three tiers of rate limiting are implemented:

- **General API**: 100 requests per 15 minutes (configurable)
- **Authentication endpoints**: 20 requests per minute (stricter)
- **File uploads**: 10 requests per hour (when implemented)

Rate limits return standard headers:

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: When the window resets

### 3. Request Size Limits

- **JSON payloads**: 10MB default
- **URL-encoded data**: 10MB default
- **Raw data (file uploads)**: 50MB default

### 4. Input Sanitization

- MongoDB/NoSQL injection protection via express-mongo-sanitize
- Removes any keys containing prohibited characters
- Logs sanitization attempts with request ID

### 5. Request Tracking

- Every request gets a unique UUID (`x-request-id`)
- Request IDs are included in all logs and error responses
- Helps with debugging and security incident investigation

### 6. CORS Configuration

- Configurable allowed origins
- Explicit method and header allowlists
- Credentials support for authenticated requests

### 7. IP Blocking (Optional)

- Can block specific IPs via environment configuration
- Runtime blocking/unblocking via utility functions
- Disabled by default

### 8. Security Logging

- All requests logged with timestamp, IP, user agent
- Configurable log levels (error, warn, info, debug)
- Security events (rate limits, blocks) logged separately

## Environment Variables

See `.env.example` for all security-related configuration options.

Key variables:

- `RATE_LIMIT_*`: Configure rate limiting windows and max requests
- `*_SIZE_LIMIT`: Configure request size limits
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `IP_BLOCKING_ENABLED`: Enable/disable IP blocking
- `SECURITY_LOGGING_ENABLED`: Enable/disable security logging

## Best Practices for Developers

### 1. Authentication & Authorization

- Always validate JWT tokens on protected routes
- Use the auth middleware for protected endpoints
- Never expose sensitive user data in responses
- Implement proper session management

### 2. Input Validation

- Always validate request data using Zod schemas
- Sanitize user input before database operations
- Use parameterized queries (Prisma handles this)
- Never trust client-side validation alone

### 3. Error Handling

- Never expose internal error details in production
- Always include request ID in error responses
- Log security-relevant errors appropriately
- Use proper HTTP status codes

### 4. Data Protection

- Use HTTPS in production (handled by Vercel)
- Encrypt sensitive data at rest
- Implement proper access controls
- Follow principle of least privilege

### 5. API Design

- Use proper REST conventions
- Version your APIs appropriately
- Document rate limits and constraints
- Implement pagination for list endpoints

## Security Checklist for New Endpoints

- [ ] Protected by appropriate authentication middleware
- [ ] Input validation with Zod schemas
- [ ] Appropriate rate limiting applied
- [ ] Error handling doesn't leak sensitive info
- [ ] Follows REST conventions and naming
- [ ] Documented in API documentation
- [ ] Tested for common vulnerabilities
- [ ] Logging includes security-relevant events

## Incident Response

If a security incident occurs:

1. Check logs for the request ID
2. Review security logs for patterns
3. Consider blocking IPs if necessary
4. Update rate limits if needed
5. Document and report the incident

## Regular Security Tasks

- Review rate limit configurations monthly
- Check for security package updates
- Monitor error logs for patterns
- Update security headers as needed
- Review and rotate secrets regularly

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
