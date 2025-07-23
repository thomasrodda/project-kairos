# API Endpoint: [Endpoint Name]

> [Brief description of what this endpoint does and its purpose]

---

## Endpoint Details

- **URL**: `/api/[path]`
- **Method**: `GET` | `POST` | `PUT` | `PATCH` | `DELETE`
- **Authentication**: Required | Not Required
- **Rate Limiting**: [If applicable]

## Request

### Headers

```http
Authorization: Bearer <token>  # If authentication required
Content-Type: application/json
```

### URL Parameters

| Parameter | Type   | Required | Description                              |
| --------- | ------ | -------- | ---------------------------------------- |
| `id`      | string | Yes      | [Description]                            |
| `param`   | string | No       | [Description with default if applicable] |

### Query Parameters

| Parameter | Type   | Required | Description           | Default |
| --------- | ------ | -------- | --------------------- | ------- |
| `filter`  | string | No       | [What it filters]     | -       |
| `limit`   | number | No       | [Max items to return] | 10      |
| `offset`  | number | No       | [Pagination offset]   | 0       |

### Request Body

```typescript
{
  // Required fields
  fieldName: string       // Description of field
  anotherField: number    // What this represents

  // Optional fields
  optionalField?: boolean // Description and default
  nestedObject?: {
    subField: string
  }
}
```

### Validation Rules

- `fieldName`: Must be 1-255 characters
- `anotherField`: Must be positive integer
- [Other validation rules]

## Response

### Success Response

**Status Code**: `200 OK` | `201 Created` | `204 No Content`

```typescript
{
  success: true,
  data: {
    id: string,
    fieldName: string,
    createdAt: string,    // ISO 8601 format
    updatedAt: string,    // ISO 8601 format
    // ... other fields
  },
  message?: string        // Optional success message
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "fieldName": "Field is required"
    }
  }
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Examples

### Example Request

```bash
curl -X POST https://api.projectkairos.com/api/[endpoint] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldName": "Example value",
    "anotherField": 42
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "fieldName": "Example value",
    "anotherField": 42,
    "createdAt": "2025-01-23T10:30:00Z",
    "updatedAt": "2025-01-23T10:30:00Z"
  }
}
```

## Implementation Details

### File Location

`apps/api/[endpoint].ts` or `apps/api/[resource]/[action].ts`

### Key Functions

- `handler()`: Main request handler
- `validateInput()`: Input validation using Zod
- `processData()`: Business logic
- [Other important functions]

### Database Operations

[Describe what database operations this endpoint performs]

```typescript
// Example Prisma query
const result = await prisma.model.create({
  data: {
    // fields
  },
})
```

### Middleware

- `requireAuth`: Validates authentication token
- [Other middleware used]

## Error Handling

[Describe specific error cases and how they're handled]

- **Invalid input**: Returns 400 with validation errors
- **Resource not found**: Returns 404
- **Duplicate entry**: Returns 409 Conflict
- **Database errors**: Logged and returns 500

## Performance Considerations

- [Caching strategy if applicable]
- [Database query optimization]
- [Response size limits]
- [Timeout settings]

## Security Considerations

- [Input sanitization methods]
- [Authorization checks performed]
- [Rate limiting rules]
- [Data exposure limits]

## Related Endpoints

- `GET /api/[related]`: [How they work together]
- `PUT /api/[resource]/{id}`: [Update counterpart]
- `DELETE /api/[resource]/{id}`: [Delete counterpart]

## Frontend Usage

```typescript
// Example using BaseApiClient
const response = await apiClient.post('/api/[endpoint]', {
  fieldName: 'value',
  anotherField: 42,
})

// Example in a service
class ResourceService extends BaseApiClient {
  async createResource(data: CreateResourceDto) {
    return this.post<ResourceResponse>('/api/[endpoint]', data)
  }
}
```

## Testing

### Unit Tests

- Input validation tests
- Business logic tests
- Error handling tests

### Integration Tests

- Full request/response flow
- Database operations
- Authentication flow

## Changelog

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2025-01-23 | Initial implementation |

## Notes

- [Any special considerations]
- [Known limitations]
- [Future improvements planned]
