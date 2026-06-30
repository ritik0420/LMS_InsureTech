# InsureTech Skills LMS — API Testing Guide

Backend API for the InsureTech Skills LMS. Use this document to test endpoints with curl, PowerShell, or Postman.

## Prerequisites

1. Copy environment variables into `.env` (see project setup).
2. Install dependencies:

```bash
npm install
```

3. Seed the default admin (first time only):

```bash
npm run seed:admin
```

4. Start the server:

```bash
npm run dev
```

Default base URL: `http://localhost:5000`

---

## Authentication

Protected routes require a JWT in the header:

```
Authorization: Bearer <your_token>
```

Tokens expire after **1 day**. Role-specific login endpoints only accept users with the matching role (`ADMIN` or `STUDENT`).

### Default admin (after seed)

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@insuretech.com` |
| Password | `Admin@123`            |

Override via `.env`: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.

---

## Roles

| Role     | Access                                      |
|----------|---------------------------------------------|
| `ADMIN`  | Student CRUD, upload certificates           |
| `STUDENT`| Profile, documents, view/download certificates |

---

## Common response codes

| Code | Meaning                                      |
|------|----------------------------------------------|
| 200  | Success                                      |
| 201  | Created                                      |
| 400  | Bad request (missing/invalid input)          |
| 401  | Unauthorized (missing/invalid token)       |
| 403  | Forbidden (wrong role)                       |
| 404  | Resource not found                           |
| 409  | Conflict (e.g. duplicate email)              |
| 500  | Server error                                 |

---

## Health check

**GET** `/api/health`

No auth required.

```bash
curl http://localhost:5000/api/health
```

**Response (200)**

```json
{
  "status": "ok",
  "service": "LMS Backend"
}
```

---

## Auth endpoints

### Admin login

**POST** `/api/auth/admin/login`

**Body**

```json
{
  "email": "admin@insuretech.com",
  "password": "Admin@123"
}
```

```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@insuretech.com\",\"password\":\"Admin@123\"}"
```

**PowerShell**

```powershell
$admin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@insuretech.com","password":"Admin@123"}'
$adminToken = $admin.token
```

**Response (200)**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "665f...",
    "fullName": "System Admin",
    "email": "admin@insuretech.com",
    "role": "ADMIN",
    "phone": "",
    "address": ""
  }
}
```

---

### Student login

**POST** `/api/auth/student/login`

**Body**

```json
{
  "email": "john@student.com",
  "password": "Student@123"
}
```

```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@student.com\",\"password\":\"Student@123\"}"
```

**PowerShell**

```powershell
$student = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/student/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"john@student.com","password":"Student@123"}'
$studentToken = $student.token
```

---

## Admin endpoints

All admin routes require `Authorization: Bearer <admin_token>`.

### Create student

**POST** `/api/admin/students`

**Body**

```json
{
  "fullName": "John Student",
  "email": "john@student.com",
  "password": "Student@123",
  "phone": "9876543210",
  "address": "Mumbai, India"
}
```

Required: `fullName`, `email`, `password`. Optional: `phone`, `address`.

```bash
curl -X POST http://localhost:5000/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{\"fullName\":\"John Student\",\"email\":\"john@student.com\",\"password\":\"Student@123\"}"
```

**Response (201)**

```json
{
  "message": "Student created successfully",
  "student": {
    "id": "665f...",
    "fullName": "John Student",
    "email": "john@student.com",
    "role": "STUDENT",
    "phone": "9876543210",
    "address": "Mumbai, India",
    "isActive": true,
    "documents": [],
    "certificates": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### List students

**GET** `/api/admin/students`

```bash
curl http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (200)**

```json
{
  "students": [
    {
      "_id": "665f...",
      "fullName": "John Student",
      "email": "john@student.com",
      "role": "STUDENT",
      "isActive": true,
      "documents": [],
      "certificates": []
    }
  ]
}
```

---

### Get student by ID

**GET** `/api/admin/students/:id`

```bash
curl http://localhost:5000/api/admin/students/STUDENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (200)**

```json
{
  "student": { ... }
}
```

---

### Update student

**PUT** `/api/admin/students/:id`

**Body** (all fields optional)

```json
{
  "fullName": "John Updated",
  "email": "john.new@student.com",
  "phone": "1112223333",
  "address": "Delhi, India",
  "password": "NewPassword@123",
  "isActive": true
}
```

```bash
curl -X PUT http://localhost:5000/api/admin/students/STUDENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{\"fullName\":\"John Updated\",\"phone\":\"1112223333\"}"
```

**Response (200)**

```json
{
  "message": "Student updated successfully",
  "student": { ... }
}
```

---

### Deactivate student

**DELETE** `/api/admin/students/:id`

Soft delete: sets `isActive` to `false`.

```bash
curl -X DELETE http://localhost:5000/api/admin/students/STUDENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (200)**

```json
{
  "message": "Student deactivated successfully"
}
```

---

### Upload certificate for student

**POST** `/api/admin/students/:id/certificates`

**Multipart form fields**

| Field         | Type | Required | Description        |
|---------------|------|----------|--------------------|
| `certificate` | file | Yes      | PDF, JPG, or PNG   |
| `title`       | text | Yes      | Certificate title  |

Max file size: **10 MB**.

```bash
curl -X POST http://localhost:5000/api/admin/students/STUDENT_ID/certificates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "certificate=@./sample-certificate.pdf" \
  -F "title=Course Completion Certificate"
```

**PowerShell**

```powershell
$form = @{
  certificate = Get-Item -Path ".\sample-certificate.pdf"
  title       = "Course Completion Certificate"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/students/$studentId/certificates" `
  -Method POST -Headers @{ Authorization = "Bearer $adminToken" } -Form $form
```

**Response (201)**

```json
{
  "message": "Certificate uploaded successfully",
  "certificate": {
    "_id": "665f...",
    "title": "Course Completion Certificate",
    "filename": "cert-1718....pdf",
    "originalName": "sample-certificate.pdf",
    "mimeType": "application/pdf",
    "size": 12345,
    "uploadedBy": "665f...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Save `certificate._id` for student download tests.

---

## Student endpoints

All student routes require `Authorization: Bearer <student_token>`.

### Get profile

**GET** `/api/student/profile`

```bash
curl http://localhost:5000/api/student/profile \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Response (200)**

```json
{
  "student": {
    "_id": "665f...",
    "fullName": "John Student",
    "email": "john@student.com",
    "role": "STUDENT",
    "phone": "",
    "address": "",
    "documents": [],
    "certificates": []
  }
}
```

---

### Update profile

**PUT** `/api/student/profile`

**Body** (all optional)

```json
{
  "fullName": "John Student",
  "phone": "9876543210",
  "address": "Mumbai, India",
  "password": "NewPassword@123"
}
```

Students cannot change `email` or `role` via this endpoint.

```bash
curl -X PUT http://localhost:5000/api/student/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d "{\"phone\":\"9876543210\",\"address\":\"Mumbai, India\"}"
```

**Response (200)**

```json
{
  "message": "Profile updated successfully",
  "student": { ... }
}
```

---

### List documents

**GET** `/api/student/documents`

```bash
curl http://localhost:5000/api/student/documents \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Response (200)**

```json
{
  "documents": [
    {
      "_id": "665f...",
      "filename": "doc-1718....pdf",
      "originalName": "id-proof.pdf",
      "mimeType": "application/pdf",
      "size": 54321,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### Upload document

**POST** `/api/student/documents`

**Multipart form fields**

| Field      | Type | Required | Description        |
|------------|------|----------|--------------------|
| `document` | file | Yes      | PDF, JPG, or PNG   |

Max file size: **10 MB**.

```bash
curl -X POST http://localhost:5000/api/student/documents \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -F "document=@./id-proof.pdf"
```

**PowerShell**

```powershell
$form = @{ document = Get-Item -Path ".\id-proof.pdf" }
Invoke-RestMethod -Uri "http://localhost:5000/api/student/documents" `
  -Method POST -Headers @{ Authorization = "Bearer $studentToken" } -Form $form
```

**Response (201)**

```json
{
  "message": "Document uploaded successfully",
  "document": {
    "_id": "665f...",
    "filename": "doc-1718....pdf",
    "originalName": "id-proof.pdf",
    "mimeType": "application/pdf",
    "size": 54321,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### Delete document

**DELETE** `/api/student/documents/:documentId`

```bash
curl -X DELETE http://localhost:5000/api/student/documents/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Response (200)**

```json
{
  "message": "Document deleted successfully"
}
```

---

### List certificates

**GET** `/api/student/certificates`

```bash
curl http://localhost:5000/api/student/certificates \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Response (200)**

```json
{
  "certificates": [
    {
      "_id": "665f...",
      "title": "Course Completion Certificate",
      "filename": "cert-1718....pdf",
      "originalName": "sample-certificate.pdf",
      "mimeType": "application/pdf",
      "size": 12345,
      "uploadedBy": "665f...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### Download certificate

**GET** `/api/student/certificates/:certificateId/download`

Returns the file as a download (not JSON).

```bash
curl -O -J http://localhost:5000/api/student/certificates/CERTIFICATE_ID/download \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**PowerShell**

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/student/certificates/$certId/download" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -OutFile "downloaded-certificate.pdf"
```

---

## End-to-end test flow

Run these steps in order to verify the full workflow:

```powershell
# 1. Health check
Invoke-RestMethod http://localhost:5000/api/health

# 2. Admin login
$admin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@insuretech.com","password":"Admin@123"}'
$adminToken = $admin.token

# 3. Create student
$created = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/students" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -Body '{"fullName":"Test Student","email":"test@student.com","password":"Student@123"}'
$studentId = $created.student.id

# 4. Student login
$student = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/student/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@student.com","password":"Student@123"}'
$studentToken = $student.token

# 5. Update profile
Invoke-RestMethod -Uri "http://localhost:5000/api/student/profile" `
  -Method PUT -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -Body '{"phone":"9999999999"}'

# 6. Upload document (replace path with a real file)
$form = @{ document = Get-Item -Path ".\sample.pdf" }
Invoke-RestMethod -Uri "http://localhost:5000/api/student/documents" `
  -Method POST -Headers @{ Authorization = "Bearer $studentToken" } -Form $form

# 7. Admin uploads certificate
$form = @{
  certificate = Get-Item -Path ".\sample-certificate.pdf"
  title       = "Completion Certificate"
}
$cert = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/students/$studentId/certificates" `
  -Method POST -Headers @{ Authorization = "Bearer $adminToken" } -Form $form
$certId = $cert.certificate._id

# 8. Student downloads certificate
Invoke-WebRequest -Uri "http://localhost:5000/api/student/certificates/$certId/download" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -OutFile "downloaded-certificate.pdf"
```

---

## Postman tips

1. Create an environment variable `baseUrl` = `http://localhost:5000`.
2. After login, save `token` to an environment variable (e.g. `adminToken` / `studentToken`).
3. For protected routes, set **Authorization** → **Bearer Token** → `{{adminToken}}`.
4. For file uploads, use **Body** → **form-data** with the correct field names (`document`, `certificate`, `title`).

---

## File upload rules

| Rule        | Value                          |
|-------------|--------------------------------|
| Allowed     | PDF, JPG, PNG                  |
| Max size    | 10 MB per file                 |
| Storage     | `uploads/documents/`, `uploads/certificates/` |

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| `401 Invalid or expired token` | Token missing or expired | Log in again |
| `403 Access denied` | Wrong role for endpoint | Use admin token on `/api/admin/*`, student token on `/api/student/*` |
| `403 ADMIN account required` | Student tried admin login | Use `/api/auth/student/login` |
| `409 Email already in use` | Duplicate email | Use a different email |
| `Only PDF, JPG, and PNG files are allowed` | Wrong file type | Upload a supported format |
| `File size must be under 10MB` | File too large | Reduce file size |
| `MONGODB_URI is not defined` | Missing `.env` | Add `MONGODB_URI` to `.env` |
| `JWT secret is not configured` | Missing secret | Add `JWT_SECRET` to `.env` |
