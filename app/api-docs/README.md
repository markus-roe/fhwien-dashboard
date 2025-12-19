# API Documentation

This project uses `next-swagger-doc` to automatically generate OpenAPI 3.0 specifications from JSDoc comments in your API routes.

## Accessing the Documentation

- **Swagger UI**: Visit `/api-docs` in your browser
- **OpenAPI JSON**: Access `/api-docs` (API route) to get the raw OpenAPI specification

## How to Document Your API Routes

Add JSDoc comments with `@swagger` tags to your route handlers. Here's an example:

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
  // ... your implementation
}
```

## Schema Definitions

You can define reusable schemas in your JSDoc comments or reference them. For example:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 */
```

## Common Patterns

### GET with Query Parameters

```typescript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 */
```

### POST with Request Body

```typescript
/**
 * @swagger
 * /api/resource:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 */
```

### Error Responses

```typescript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     responses:
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Not found
 */
```

## Next Steps

1. Add JSDoc comments to all your API routes
2. Define reusable schemas in a central location
3. Test the generated documentation at `/api-docs`
4. Export the OpenAPI spec for use with other tools (Postman, code generators, etc.)
