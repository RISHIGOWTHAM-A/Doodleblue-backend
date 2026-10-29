# DoodleBlue Role-Based Backend Authentication & Authorization

Backend API implementation featuring Role-Based Access Control (**RBAC**), JWT session authentication, strict authorization boundaries for **Student** and **Faculty** roles, and **Soft Delete** functionality.

---

## Architecture & Folder Structure

```
doodleBlue-backend/
├── config/
│   └── db.js                      # MongoDB connection setup
├── controllers/
│   └── user.controller.js         # HTTP controllers & permission gating
├── jwt/
│   └── token.json.service.js      # JWT signing (payload with role) and verification
├── middleware/
│   ├── auth.middleware.js         # JWT Bearer token authentication
│   ├── auth.midleware.js          # Backwards-compatible alias
│   └── role.middleware.js         # Role authorization middleware
├── models/
│   └── user.model.js              # Mongoose user schema with role & soft-delete query hooks
├── routes/
│   └── user.routes.js             # Express API routes
├── services/
│   └── user.services.js           # Business logic, query filters, soft-delete operations
├── app.js                         # Express application setup
└── .env                           # Environment configuration
```

---

## Authentication & Roles

### 1. Roles
- `student`: Standard learner account.
- `faculty`: Academic instructor / administrative account.

### 2. JWT Payload
Tokens signed by `tokenService` contain:
```json
{
  "id": "<user_object_id>",
  "email": "<user_email>",
  "role": "student | faculty",
  "isActive": true,
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## Permission Matrix

| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/api/users/signup` | `POST` | Public | Register with `name`, `email`, `password`, `role` |
| `/api/users/login` | `POST` | Public | Authenticate and obtain JWT token |
| `/api/users/profile` | `GET` | Student & Faculty | View own profile (`req.user.id`) |
| `/api/users/students` | `GET` | Faculty only | Get all non-deleted students (403 for Students) |
| `/api/users/faculties` | `GET` | Faculty only | Get all non-deleted faculties (403 for Students) |
| `/api/users/students/:id` | `GET` | Faculty or Own Student | View specific student |
| `/api/users/students/:id` | `PATCH` | Faculty or Own Student | Update student profile |
| `/api/users/students/:id` | `DELETE` | Faculty only | **Soft-deletes** student (`isDeleted: true`) |
| `/api/users/:id` | `GET` | Faculty or Self | View user. (Faculty **cannot** view other faculty profiles) |
| `/api/users/:id` | `PATCH` | Faculty or Self | Update user account |
| `/api/users/:id` | `DELETE` | Self / Faculty | Soft delete user |

---

## Soft Delete Mechanism
- Deleted accounts are **never removed** from the database.
- Marked with:
  ```json
  {
    "isDeleted": true,
    "isActive": false,
    "deletedAt": "2026-10-29T..."
  }
  ```
- Soft-deleted users:
  - Excluded automatically from `getAllStudents` and `getAllFaculty`.
  - Blocked from logging in (`403 Forbidden: "This account has been deleted or deactivated"`).

---

## How to Test with Postman

1. Open Postman.
2. Click **Import** in the top left.
3. Select `postman_collection.json` located in the root of this project.
4. Run requests in sequence:
   - **Signup - Student** and **Signup - Faculty**
   - **Login - Student** (automatically stores `{{studentToken}}` and `{{studentId}}`)
   - **Login - Faculty** (automatically stores `{{facultyToken}}` and `{{facultyId}}`)
   - Test Student permissions (accessing `/students` returns `403 Forbidden`).
   - Test Faculty permissions (viewing `/students`, updating student, soft deleting student).

---

## Running Integration Tests

Run the included automated integration suite:
```bash
node test-runner.js
```
Expected output:
```
=== FINAL RESULT: 24 PASSED, 0 FAILED ===
```
