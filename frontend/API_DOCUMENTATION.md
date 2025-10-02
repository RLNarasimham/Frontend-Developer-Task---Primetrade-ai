# API Documentation

This document provides comprehensive API documentation for the Task Management Application using Supabase as the backend.

## Overview

The application uses Supabase which provides:
- **Authentication**: JWT-based authentication with email/password
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Auto-generated REST API**: Accessible through Supabase client library

## Base URL

```
https://jsicgxmpjrvquxvqxkiu.supabase.co
```

## Authentication

All API requests require authentication using JWT tokens managed by Supabase Auth.

### Headers

```
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

---

## Endpoints

### 1. Authentication

#### Sign Up

**Method**: `POST`
**Endpoint**: `/auth/v1/signup`
**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "options": {
    "data": {
      "full_name": "John Doe"
    }
  }
}
```

**Response** (Success - 200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-10-02T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

**Validation Rules**:
- Email: Required, valid email format
- Password: Minimum 6 characters
- Full Name: Minimum 2 characters

---

#### Sign In

**Method**: `POST`
**Endpoint**: `/auth/v1/token?grant_type=password`
**Description**: Authenticate existing user

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response** (Success - 200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

**Error Responses**:
- 400: Invalid email or password
- 401: Invalid credentials

---

#### Sign Out

**Method**: `POST`
**Endpoint**: `/auth/v1/logout`
**Description**: Invalidate current session

**Headers**: Requires Authorization header

**Response** (Success - 204):
No content

---

### 2. Profile Management

#### Get User Profile

**Method**: `GET`
**Endpoint**: `/rest/v1/profiles?id=eq.<user_id>`
**Description**: Fetch authenticated user's profile

**Headers**: Requires Authorization

**Response** (Success - 200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-10-02T00:00:00Z",
  "updated_at": "2025-10-02T00:00:00Z"
}
```

---

#### Update Profile

**Method**: `PATCH`
**Endpoint**: `/rest/v1/profiles?id=eq.<user_id>`
**Description**: Update user profile information

**Headers**: Requires Authorization

**Request Body**:
```json
{
  "full_name": "Jane Doe"
}
```

**Response** (Success - 200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "updated_at": "2025-10-02T01:00:00Z"
}
```

**Validation Rules**:
- Full Name: Minimum 2 characters

---

### 3. Task Management (CRUD Operations)

#### Create Task

**Method**: `POST`
**Endpoint**: `/rest/v1/tasks`
**Description**: Create a new task

**Headers**: Requires Authorization

**Request Body**:
```json
{
  "user_id": "uuid",
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "pending",
  "priority": "high"
}
```

**Response** (Success - 201):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "pending",
  "priority": "high",
  "created_at": "2025-10-02T00:00:00Z",
  "updated_at": "2025-10-02T00:00:00Z"
}
```

**Validation Rules**:
- Title: Required, 3-100 characters
- Description: Optional, max 500 characters
- Status: Must be one of: `pending`, `in_progress`, `completed`
- Priority: Must be one of: `low`, `medium`, `high`

---

#### Get All Tasks

**Method**: `GET`
**Endpoint**: `/rest/v1/tasks?user_id=eq.<user_id>&order=created_at.desc`
**Description**: Retrieve all tasks for authenticated user

**Headers**: Requires Authorization

**Query Parameters**:
- `select`: Fields to return (default: *)
- `order`: Sort order (e.g., `created_at.desc`)
- `status`: Filter by status (optional)
- `priority`: Filter by priority (optional)

**Response** (Success - 200):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Task 1",
    "description": "Description",
    "status": "pending",
    "priority": "high",
    "created_at": "2025-10-02T00:00:00Z",
    "updated_at": "2025-10-02T00:00:00Z"
  }
]
```

---

#### Get Single Task

**Method**: `GET`
**Endpoint**: `/rest/v1/tasks?id=eq.<task_id>&user_id=eq.<user_id>`
**Description**: Retrieve a specific task

**Headers**: Requires Authorization

**Response** (Success - 200):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "in_progress",
  "priority": "medium",
  "created_at": "2025-10-02T00:00:00Z",
  "updated_at": "2025-10-02T00:00:00Z"
}
```

---

#### Update Task

**Method**: `PATCH`
**Endpoint**: `/rest/v1/tasks?id=eq.<task_id>`
**Description**: Update an existing task

**Headers**: Requires Authorization

**Request Body** (partial update):
```json
{
  "title": "Updated task title",
  "status": "completed",
  "priority": "low"
}
```

**Response** (Success - 200):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Updated task title",
  "description": "Task description",
  "status": "completed",
  "priority": "low",
  "created_at": "2025-10-02T00:00:00Z",
  "updated_at": "2025-10-02T02:00:00Z"
}
```

---

#### Delete Task

**Method**: `DELETE`
**Endpoint**: `/rest/v1/tasks?id=eq.<task_id>`
**Description**: Delete a task

**Headers**: Requires Authorization

**Response** (Success - 204):
No content

---

## Security

### Row Level Security (RLS)

All database tables have RLS enabled with the following policies:

**Profiles Table**:
- Users can only view their own profile
- Users can only update their own profile
- Profile creation handled automatically on signup

**Tasks Table**:
- Users can only view their own tasks
- Users can only create tasks for themselves
- Users can only update their own tasks
- Users can only delete their own tasks

### Password Security

- Passwords are hashed using bcrypt (handled by Supabase Auth)
- Minimum password length: 6 characters
- Password validation on both client and server side

### JWT Tokens

- Access tokens expire after 1 hour
- Refresh tokens used for session renewal
- Tokens automatically refreshed by Supabase client

---

## Error Handling

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied by RLS |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry (e.g., email) |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "code": "error_code",
    "details": "Additional details"
  }
}
```

---

## Rate Limiting

Supabase implements rate limiting on API endpoints:
- Authentication: 30 requests per hour per IP
- Database operations: Based on subscription tier

---

## Client-Side Usage Example

```typescript
import { supabase } from './lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { full_name: 'John Doe' }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get tasks
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Create task
const { data, error } = await supabase
  .from('tasks')
  .insert([{
    user_id: userId,
    title: 'New Task',
    description: 'Task description',
    status: 'pending',
    priority: 'medium'
  }]);

// Update task
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'completed' })
  .eq('id', taskId);

// Delete task
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

---

## Scalability Notes

### Current Implementation
- Supabase provides auto-scaling PostgreSQL database
- Connection pooling handled automatically
- CDN for static assets via Vite build

### Production Recommendations

1. **Database Optimization**
   - Indexes already created on frequently queried columns
   - Consider adding composite indexes for complex queries
   - Monitor query performance with Supabase Dashboard

2. **Caching Strategy**
   - Implement React Query for client-side caching
   - Use Supabase Realtime for live updates
   - Cache static profile data in localStorage

3. **Load Balancing**
   - Supabase handles database load balancing
   - Deploy frontend to Vercel/Netlify for edge caching
   - Use CDN for static assets

4. **Monitoring**
   - Enable Supabase logging and monitoring
   - Implement error tracking (Sentry)
   - Monitor API response times

5. **Security Enhancements**
   - Enable email verification
   - Implement rate limiting on client side
   - Add CAPTCHA for signup/login
   - Enable 2FA for sensitive accounts

---

## Testing with Postman/cURL

### Example cURL Requests

**Sign Up**:
```bash
curl -X POST 'https://jsicgxmpjrvquxvqxkiu.supabase.co/auth/v1/signup' \
-H 'apikey: YOUR_ANON_KEY' \
-H 'Content-Type: application/json' \
-d '{
  "email": "test@example.com",
  "password": "password123",
  "options": {
    "data": {
      "full_name": "Test User"
    }
  }
}'
```

**Get Tasks**:
```bash
curl -X GET 'https://jsicgxmpjrvquxvqxkiu.supabase.co/rest/v1/tasks' \
-H 'apikey: YOUR_ANON_KEY' \
-H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review error logs in Supabase Dashboard
- Check browser console for client-side errors
