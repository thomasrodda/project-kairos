# API Response and Error Handling Utilities

This directory contains standardized utilities for API responses and error handling in the Project Kairos backend.

## Overview

The utilities provide:

- Standardized API response format
- Custom error classes with proper HTTP status codes
- Request/response logging with unique request IDs
- Error handling middleware
- Helper functions for common response patterns

## API Response Format

All API responses follow this standard format:

```typescript
{
  "success": boolean,
  "data": T | undefined,
  "error": {
    "code": string,
    "message": string,
    "details": any
  } | undefined,
  "meta": {
    "requestId": string,
    "timestamp": string,
    "page": number | undefined,
    "limit": number | undefined,
    "total": number | undefined
  }
}
```

## Usage Examples

### Success Responses

```typescript
import { successResponse, createdResponse, paginatedResponse } from '../utils'

// Simple success
successResponse(res, { id: 1, name: 'John' })

// Created with location header
createdResponse(res, newUser, `/api/users/${newUser.id}`)

// Paginated response
paginatedResponse(res, users, { page: 1, limit: 20, total: 100 })
```

### Error Handling

```typescript
import { ValidationError, NotFoundError, ConflictError } from '../utils'

// Throw custom errors
throw new ValidationError('Email is required', { field: 'email' })
throw new NotFoundError('User', userId)
throw new ConflictError('Email already exists')
```

### Using asyncHandler

```typescript
import { asyncHandler } from '../middleware'

// Wrap async routes to automatically catch errors
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    throw new NotFoundError('User', req.params.id)
  }
  return successResponse(res, user)
})
```

## Error Classes

| Class                 | HTTP Status | Use Case                            |
| --------------------- | ----------- | ----------------------------------- |
| `ValidationError`     | 400         | Invalid input data                  |
| `AuthenticationError` | 401         | No/invalid authentication           |
| `AuthorizationError`  | 403         | Insufficient permissions            |
| `NotFoundError`       | 404         | Resource not found                  |
| `ConflictError`       | 409         | Resource conflict (e.g., duplicate) |
| `RateLimitError`      | 429         | Too many requests                   |
| `AppError`            | Custom      | Base class for custom errors        |

## Request Logging

All requests are automatically logged with:

- Unique request ID (in `x-request-id` header)
- Method, path, status code
- Response time
- User ID (if authenticated)
- Structured JSON logs in production

## Integration with Express App

To use these utilities in your Express app:

```typescript
import { requestLogger, errorHandler, notFoundHandler } from './middleware'

const app = express()

// Add request logging (early in middleware stack)
app.use(requestLogger)

// ... your routes ...

// Add 404 handler (after all routes)
app.use(notFoundHandler)

// Add error handler (last middleware)
app.use(errorHandler)
```

## Best Practices

1. **Always throw custom errors** instead of sending error responses directly
2. **Use asyncHandler** for all async route handlers
3. **Include meaningful error details** in ValidationError
4. **Let errors bubble up** to the global error handler
5. **Use appropriate HTTP status codes** via the error classes

## Environment Variables

- `NODE_ENV`: Set to 'production' for JSON logging and hiding internal errors
- Log level is automatically adjusted based on environment
