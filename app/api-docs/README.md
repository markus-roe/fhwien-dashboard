# API Documentation

This project uses `next-swagger-doc` to automatically generate OpenAPI 3.0 specifications from JSDoc comments in API routes.

## Accessing the Documentation

- **Interactive API Documentation**: Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser (Scalar API Reference)
- **OpenAPI JSON**: Access [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi) to get the raw OpenAPI specification in JSON format

The documentation is automatically generated from JSDoc comments in API route files and schema definitions in `app/api-docs/schemas.ts`.

## How to Document API Routes

Add JSDoc comments with `@swagger` tags to route handlers. Here's an example:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: program
 *         schema:
 *           type: string
 *         description: Filter by program
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 */
export async function GET(request: NextRequest) {
  // ... implementation
}
```

## Schema Definitions

Reusable schemas are defined in `app/api-docs/schemas.ts` and can be referenced in JSDoc comments using `$ref`. The schemas are automatically included in the OpenAPI specification.

### Available Schemas

- `UserResponse` - User object returned by the API
- `CreateUserRequest` - Request body for creating a user
- `UpdateUserRequest` - Request body for updating a user
- `SessionResponse` - Session object returned by the API
- `CreateSessionRequest` - Request body for creating a session
- `UpdateSessionRequest` - Request body for updating a session
- `GroupResponse` - Group object returned by the API
- `CreateGroupRequest` - Request body for creating a group
- `UpdateGroupRequest` - Request body for updating a group
- `CoachingSlotResponse` - Coaching slot object returned by the API
- `CreateCoachingSlotRequest` - Request body for creating a coaching slot
- `UpdateCoachingSlotRequest` - Request body for updating a coaching slot
- `CourseResponse` - Course object returned by the API
- `ApiError` - Standard error response format
- `ApiSuccess` - Standard success response format
- `UserRef` - Simplified user reference (for lecturer, participant displays)

### Referencing Schemas

Reference schemas in JSDoc comments like this:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 */
```

## Common Patterns

### GET with Query Parameters

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: program
 *         schema:
 *           type: string
 *           enum: [DTI, DI, all]
 *         description: Filter by program
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 */
```

### POST with Request Body

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
```

### Path Parameters

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
```

### Error Responses

Always document all possible error responses:

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request - invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
```

### Authentication

For endpoints that require authentication, add security documentation:

```typescript
/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 */
```

## Best Practices

1. **Always document all HTTP methods** for an endpoint (GET, POST, PUT, DELETE)
2. **Include all possible response codes** (200, 201, 400, 401, 403, 404, 500)
3. **Use schema references** (`$ref`) instead of inline schemas when possible
4. **Add descriptions** to parameters, request bodies, and responses
5. **Use appropriate tags** to group related endpoints
6. **Document authentication requirements** with `security` field
7. **Specify required fields** in request bodies and schemas
8. **Use correct data types** (integer for IDs, not string)

## Common Issues

### Duplicate Response Keys

Make sure each HTTP status code appears only once in the responses section. If you have multiple error scenarios that return the same status code, combine them into a single response with a comprehensive description.

**Wrong:**
```yaml
responses:
  400:
    description: Bad request - invalid ID
  400:
    description: Bad request - invalid body
```

**Correct:**
```yaml
responses:
  400:
    description: Bad request - invalid ID or request body
```

### Type Mismatches

Ensure that:
- Path parameters use `type: integer` for numeric IDs
- Query parameters use appropriate types (string, integer, etc.)
- Enum values match the actual TypeScript types
- Required fields in schemas match the actual API requirements

## Available API Endpoints

The following endpoints are documented:

- **Users**: `/api/users`, `/api/users/{id}`, `/api/change-password`
- **Courses**: `/api/courses`
- **Sessions**: `/api/sessions`, `/api/sessions/{id}`
- **Groups**: `/api/groups`, `/api/groups/{id}`, `/api/groups/{id}/join`, `/api/groups/{id}/leave`
- **Coaching Slots**: `/api/coaching-slots`, `/api/coaching-slots/{id}`, `/api/coaching-slots/{id}/book`, `/api/coaching-slots/{id}/cancel`

## Next Steps

1. ✅ All API routes are documented with JSDoc comments
2. ✅ Reusable schemas are defined in `app/api-docs/schemas.ts`
3. ✅ Test the generated documentation at `/api-docs`
4. ✅ Export the OpenAPI spec for use with other tools (Postman, code generators, etc.)

## Tools Integration

The OpenAPI specification can be used with:

- **Postman**: Import the JSON spec to create a collection
- **Insomnia**: Import for API testing
- **Code Generators**: Generate client SDKs in various languages
- **API Testing Tools**: Automate API testing workflows
