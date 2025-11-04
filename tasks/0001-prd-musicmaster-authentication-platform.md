# Product Requirements Document: MusicMaster Learning Platform

## 1. Introduction/Overview

MusicMaster is an online learning platform that connects students with teachers to learn musical instruments remotely. This PRD defines the core authentication, authorization, and foundational learning features required to build a secure, role-based platform.

The platform will initially focus on **backend API development only**, providing secure REST endpoints for user authentication with SMS-based two-factor authentication (2FA), role-based authorization for three user types (student, teacher, admin), and core lesson management functionality.

### Problem Statement

Building a secure online learning platform requires robust identity verification and granular access control. Without proper authentication and authorization, the platform cannot:

- Verify user identities securely
- Protect sensitive user data
- Enforce role-specific permissions
- Prevent unauthorized access to teaching materials and student information

### Solution

A comprehensive authentication and authorization system built on NestJS with:

- SMS-based 2FA for enhanced security
- JWT-based session management with refresh tokens
- Role-based access control (RBAC) for students, teachers, and admins
- Secure API endpoints for lesson creation and student enrollment

---

## 2. Goals

1. **Security First**: Implement industry-standard authentication with SMS 2FA to prevent unauthorized access
2. **Role-Based Access**: Enable fine-grained permissions for students, teachers, and administrators
3. **Scalable Architecture**: Build a modular API that can support future features (payments, live lessons, progress tracking)
4. **Developer Experience**: Provide clear, well-documented REST endpoints following NestJS best practices
5. **User Adoption**: Create a frictionless registration and login experience that drives platform adoption

---

## 3. User Stories

### Epic 1: User Authentication & 2FA

#### 👤 User Registration

- **As a new user**, I want to register with my name, email, mobile number, and password so that I can create an account on the platform.
- **Acceptance**: System validates inputs, ensures email and mobile uniqueness, hashes password, and creates a user with default "student" role.

#### 🔐 Secure Login with 2FA

- **As a registered user**, I want to log in with my email and password and verify my identity via SMS code so that my account remains secure.
- **Acceptance**: After valid credentials, system sends SMS verification code. User must verify code to receive JWT access token.

#### 🧾 2FA Verification

- **As a user who received an SMS code**, I want to submit the code to complete login so that I can access the platform.
- **Acceptance**: Valid code returns JWT access token and HTTP-only refresh token. Invalid attempts (>3) invalidate the session.

#### 🔁 Token Refresh

- **As an authenticated user**, I want my session to refresh automatically using a refresh token so that I don't need to re-enter credentials frequently.
- **Acceptance**: Valid refresh token returns new access token without requiring password or 2FA.

#### ✏️ Profile Management

- **As an authenticated user**, I want to update my name and email so that I can keep my profile current.
- **Acceptance**: User can modify name/email but cannot change mobile number (tied to 2FA).

#### 🔑 Password Change

- **As an authenticated user**, I want to change my password securely with SMS verification so that I can maintain account security.
- **Acceptance**: Password change requires SMS code verification. Success invalidates all existing tokens.

---

### Epic 2: Authorization & Role-Based Access

#### 🧑‍🎓 Student Permissions

- **As a student**, I want to browse public lessons and enroll so that I can learn from teachers.
- **As a student**, I want to view only my enrollments and submissions so that my data remains private.
- **Acceptance**: Students can only access resources where `studentId === currentUser.id`.

#### 🧑‍🏫 Teacher Permissions

- **As a teacher**, I want to create, edit, and delete my own lessons so that I can offer my teaching services.
- **As a teacher**, I want to view and manage enrollments for my lessons so that I can control my class roster.
- **Acceptance**: Teachers can only modify lessons where `creatorId === currentUser.id`.

#### 🛡️ Admin Permissions

- **As an admin**, I want full access to manage users, lessons, and enrollments so that I can moderate the platform.
- **As an admin**, I want to change user roles and reset passwords so that I can provide support.
- **Acceptance**: Admin role bypasses ownership checks and has global access to all resources.

---

### Epic 3: Core Learning Features

#### 📚 Lesson Management

- **As a teacher**, I want to create lessons with title, description, instrument type, difficulty level, and duration so that students can find and enroll in my courses.
- **As a teacher**, I want to edit or delete my lessons so that I can keep my offerings current.
- **As a student or guest**, I want to browse available lessons by instrument or difficulty so that I can find suitable courses.

#### 📝 Enrollment System

- **As a student**, I want to enroll in a lesson so that I can access the course content.
- **As a student**, I want to view all my enrolled lessons so that I can track my learning.
- **As a teacher**, I want to view all students enrolled in my lessons so that I can manage my classes.
- **As an admin**, I want to view and manage all enrollments so that I can oversee platform usage.

---

## 4. Functional Requirements

### 4.1 Authentication Module

**4.1.1** The system MUST provide a `POST /auth/register` endpoint that accepts `name`, `email`, `mobileNumber`, and `password`.

**4.1.2** The system MUST validate registration inputs:

- Email: valid format, unique in database
- Mobile number: valid E.164 format, unique in database
- Password: minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
- Name: non-empty string, 2-100 characters

**4.1.3** The system MUST hash passwords using bcrypt with a minimum cost factor of 10 before storing.

**4.1.4** The system MUST assign the "student" role by default to all new registrations.

**4.1.5** The system MUST provide a `POST /auth/login` endpoint that accepts `email` and `password`.

**4.1.6** Upon successful login credential verification, the system MUST:

- Generate a 6-digit numeric 2FA code
- Store the code in Redis with 5-minute TTL, associated with the user's ID
- Send the code via SMS using Twilio API
- Return a temporary `pending2faToken` (valid for 5 minutes)

**4.1.7** The system MUST provide a `POST /auth/verify-2fa` endpoint that accepts `pending2faToken` and `code`.

**4.1.8** Upon successful 2FA verification, the system MUST:

- Delete the 2FA code from Redis
- Generate a JWT access token (valid for 15 minutes) containing `userId`, `email`, `role`
- Generate a refresh token (valid for 7 days) stored in HTTP-only cookie
- Return the access token in the response body

**4.1.9** The system MUST track failed 2FA attempts (max 3) and invalidate the `pending2faToken` after exceeding the limit.

**4.1.10** The system MUST provide a `POST /auth/refresh-token` endpoint that validates the refresh token cookie and returns a new access token.

**4.1.11** The system MUST provide a `GET /auth/profile` endpoint (authenticated) that returns the current user's profile (excluding password).

**4.1.12** The system MUST provide a `PATCH /auth/profile` endpoint (authenticated) that allows updating `name` and `email` only.

**4.1.13** The system MUST provide a `POST /auth/request-password-change` endpoint (authenticated) that:

- Generates a 6-digit SMS code
- Stores the code in Redis with 5-minute TTL
- Sends the code via Twilio
- Returns a `passwordChangeToken`

**4.1.14** The system MUST provide a `POST /auth/change-password` endpoint that accepts `passwordChangeToken`, `code`, and `newPassword`.

**4.1.15** Upon successful password change, the system MUST:

- Update the password hash
- Invalidate all existing access and refresh tokens for that user
- Delete the password change code from Redis

**4.1.16** The system MUST provide a `POST /auth/logout` endpoint that clears the refresh token cookie.

---

### 4.2 Authorization Module

**4.2.1** The system MUST implement a `JwtAuthGuard` to protect all authenticated routes.

**4.2.2** The system MUST implement a `RolesGuard` with `@Roles()` decorator to restrict routes by role.

**4.2.3** The system MUST store user `role` (`student`, `teacher`, `admin`) in the User entity.

**4.2.4** The system MUST include the `role` field in the JWT payload.

**4.2.5** The system MUST enforce role-based access:

- Students: Can access `/lessons` (read), `/enrollments` (own only)
- Teachers: Can access `/lessons` (CRUD own), `/enrollments` (read own lessons)
- Admins: Can access all endpoints without restrictions

**4.2.6** The system MUST implement ownership validation for resource access:

- Students can only view/modify their own enrollments
- Teachers can only modify lessons where `lesson.creatorId === currentUser.id`

**4.2.7** The system MUST provide a `GET /users/:id` endpoint (admin only) to view user details.

**4.2.8** The system MUST provide a `PATCH /users/:id/role` endpoint (admin only) to change user roles.

---

### 4.3 Lessons Module

**4.3.1** The system MUST provide a `POST /lessons` endpoint (teacher, admin) that accepts:

- `title`: string (required, 3-200 characters)
- `description`: string (required, 10-2000 characters)
- `instrument`: enum (required: piano, guitar, violin, drums, vocals, other)
- `difficultyLevel`: enum (required: beginner, intermediate, advanced)
- `durationMinutes`: number (required, 15-240)

**4.3.2** The system MUST automatically set `creatorId` to the authenticated teacher's ID when creating lessons.

**4.3.3** The system MUST provide a `GET /lessons` endpoint (public) that returns all published lessons with pagination.

**4.3.4** The system MUST provide a `GET /lessons?instrument=guitar` query filter to search by instrument.

**4.3.5** The system MUST provide a `GET /lessons?difficulty=beginner` query filter to search by difficulty.

**4.3.6** The system MUST provide a `GET /lessons/:id` endpoint (public) to view lesson details.

**4.3.7** The system MUST provide a `PATCH /lessons/:id` endpoint (teacher/admin) to update lesson details.

**4.3.8** For `PATCH /lessons/:id`, the system MUST verify:

- If user is teacher: `lesson.creatorId === currentUser.id`
- If user is admin: allow access

**4.3.9** The system MUST provide a `DELETE /lessons/:id` endpoint (teacher/admin) with same ownership validation as PATCH.

**4.3.10** The system MUST soft-delete lessons (set `deletedAt` timestamp) rather than hard delete.

---

### 4.4 Enrollments Module

**4.4.1** The system MUST provide a `POST /enrollments` endpoint (student) that accepts `lessonId`.

**4.4.2** The system MUST prevent duplicate enrollments (unique constraint on `studentId` + `lessonId`).

**4.4.3** The system MUST automatically set `studentId` to the authenticated user's ID and `enrolledAt` to current timestamp.

**4.4.4** The system MUST provide a `GET /enrollments/my-enrollments` endpoint (student) that returns only the current user's enrollments.

**4.4.5** The system MUST provide a `GET /lessons/:id/enrollments` endpoint (teacher, admin) that returns all enrollments for a specific lesson.

**4.4.6** For `GET /lessons/:id/enrollments`, the system MUST verify:

- If user is teacher: `lesson.creatorId === currentUser.id`
- If user is admin: allow access

**4.4.7** The system MUST provide a `DELETE /enrollments/:id` endpoint (student, admin) to withdraw from a lesson.

**4.4.8** For `DELETE /enrollments/:id`, the system MUST verify:

- If user is student: `enrollment.studentId === currentUser.id`
- If user is admin: allow access

**4.4.9** The system MUST return enrollment data with populated lesson and student details (exclude sensitive fields like passwords).

---

### 4.5 Data Model Requirements

**4.5.1** The system MUST implement a `User` entity with fields:

- `id`: UUID (primary key)
- `name`: string
- `email`: string (unique, indexed)
- `mobileNumber`: string (unique, indexed)
- `passwordHash`: string
- `role`: enum (student, teacher, admin)
- `createdAt`: timestamp
- `updatedAt`: timestamp

**4.5.2** The system MUST implement a `Lesson` entity with fields:

- `id`: UUID (primary key)
- `title`: string
- `description`: text
- `instrument`: enum
- `difficultyLevel`: enum
- `durationMinutes`: integer
- `creatorId`: UUID (foreign key to User)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `deletedAt`: timestamp (nullable)

**4.5.3** The system MUST implement an `Enrollment` entity with fields:

- `id`: UUID (primary key)
- `studentId`: UUID (foreign key to User)
- `lessonId`: UUID (foreign key to Lesson)
- `enrolledAt`: timestamp
- `createdAt`: timestamp
- `updatedAt`: timestamp
- Unique constraint on (`studentId`, `lessonId`)

---

### 4.6 Infrastructure Requirements

**4.6.1** The system MUST use PostgreSQL as the primary database.

**4.6.2** The system MUST use Prisma ORM for database schema management and queries.

**4.6.3** The system MUST use Redis for storing:

- 2FA verification codes (5-minute TTL)
- Password change verification codes (5-minute TTL)
- Optional: Refresh token blacklist for logout functionality

**4.6.4** The system MUST integrate Twilio API for SMS delivery with configuration for:

- Account SID
- Auth Token
- From phone number

**4.6.5** The system MUST use environment variables for all sensitive configuration (never hardcode credentials).

**4.6.6** The system MUST implement rate limiting on authentication endpoints:

- `/auth/login`: 5 requests per minute per IP
- `/auth/register`: 3 requests per minute per IP
- `/auth/verify-2fa`: 10 requests per minute per IP

---

### 4.7 Error Handling Requirements

**4.7.1** The system MUST return consistent error responses with structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be a valid email address"]
}
```

**4.7.2** The system MUST return appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid credentials, expired tokens)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error

**4.7.3** The system MUST NOT expose sensitive information in error messages (e.g., "user not found" vs "invalid credentials").

**4.7.4** The system MUST log all authentication failures with IP address and timestamp for security monitoring.

---

## 5. Non-Goals (Out of Scope)

This initial release will **NOT** include:

1. **Frontend/UI Development**: This PRD covers API development only. No web interface, mobile apps, or client-side code.

2. **Payment/Monetization**: No payment processing, subscriptions, or pricing features.

3. **Live Video Lessons**: No real-time video conferencing, WebRTC, or streaming capabilities.

4. **Assignments & Grading**: No submission system for homework or teacher evaluation tools.

5. **Progress Tracking**: No lesson completion tracking, achievements, or learning analytics.

6. **Social Features**: No messaging, forums, comments, or user interactions beyond enrollment.

7. **Content Storage**: No file upload for sheet music, audio recordings, or video tutorials.

8. **Email Notifications**: No email verification or notification system (SMS only for 2FA).

9. **Teacher Approval Workflow**: All registered teachers are approved automatically (manual role change by admin if needed).

10. **Multi-Factor Authentication Options**: Only SMS-based 2FA (no authenticator apps or email codes).

---

## 6. Technical Considerations

### 6.1 Technology Stack

- **Runtime**: Bun (JavaScript runtime and package manager)
- **Framework**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache/Session**: Redis
- **SMS Provider**: Twilio
- **Authentication**: JWT (jsonwebtoken or @nestjs/jwt)
- **Password Hashing**: bcrypt
- **Validation**: class-validator, class-transformer
- **Testing**: Jest (unit, integration, E2E)

### 6.2 Architecture Patterns

- **Modular Design**: Separate modules for Auth, Users, Lessons, Enrollments
- **Common Module**: Shared decorators (@Roles), guards (JwtAuthGuard, RolesGuard), DTOs, utilities
- **Repository Pattern**: Prisma service wrapped in repository classes for testability
- **DTO Pattern**: Separate DTOs for request validation and response serialization
- **Guard Composition**: Chain JwtAuthGuard + RolesGuard for protected routes

### 6.3 Security Best Practices

- **Password Storage**: Never store plain-text passwords; use bcrypt with cost factor ≥10
- **JWT Secrets**: Use strong, randomly generated secrets (minimum 256 bits)
- **Refresh Token Rotation**: Consider implementing refresh token rotation for extra security
- **HTTPS Only**: Enforce HTTPS in production for all API calls
- **CORS Configuration**: Restrict CORS to known frontend domains (when frontend is added)
- **SQL Injection Prevention**: Prisma ORM parameterizes queries automatically
- **Rate Limiting**: Implement IP-based rate limiting on authentication endpoints
- **Helmet.js**: Use Helmet middleware for security headers

### 6.4 Database Design

- **Indexes**: Create indexes on frequently queried fields (email, mobileNumber, creatorId, lessonId)
- **Cascading Deletes**: Define cascade behavior for foreign keys (e.g., deleting user should handle enrollments)
- **Migrations**: Use Prisma migrations for schema versioning
- **Soft Deletes**: Implement soft deletes for lessons to preserve data integrity

### 6.5 Redis Schema

```
# 2FA codes
2fa:{userId} -> {code: "123456", attempts: 0}  [TTL: 300s]

# Password change codes
pwd-change:{userId} -> {code: "654321"}  [TTL: 300s]

# Optional: Refresh token whitelist/blacklist
refresh-token:{tokenId} -> {userId, expiresAt}
```

### 6.6 Twilio Integration

- Use Twilio SDK (`twilio` npm package)
- Configuration via environment variables:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- Implement retry logic for failed SMS (3 retries with exponential backoff)
- Add logging for SMS delivery status
- Consider mock SMS service for local development/testing

### 6.7 API Documentation

- Use Swagger/OpenAPI (@nestjs/swagger) for API documentation
- Document all endpoints with request/response examples
- Include authentication requirements in Swagger annotations
- Expose docs at `/api/docs` endpoint

---

## 7. Success Metrics

### 7.1 User Adoption Metrics

**Primary Metrics**:

- **User Registrations**: Target 100+ registered users within first month of launch
- **Active Users**: 60% of registered users log in at least once per week
- **Role Distribution**: Achieve 80% students, 15% teachers, 5% admins

**Secondary Metrics**:

- **Registration Completion Rate**: 90%+ of users who start registration complete it
- **2FA Success Rate**: 95%+ of users successfully verify SMS code on first attempt
- **Login Frequency**: Average user logs in 3+ times per week

### 7.2 Security Metrics

- **Failed Authentication Rate**: <5% of login attempts fail
- **2FA Failure Rate**: <3% of 2FA attempts fail (excluding typos)
- **Account Takeover Attempts**: 0 successful unauthorized access events
- **Rate Limit Triggers**: Monitor frequency of rate limit hits (should be <1% of requests)

### 7.3 Technical Performance Metrics

- **API Response Time**: 95th percentile <500ms for all endpoints
- **Database Query Performance**: All queries execute in <100ms
- **Redis Operations**: Sub-millisecond read/write operations
- **SMS Delivery Time**: 90% of SMS codes delivered within 30 seconds

### 7.4 Monitoring & Alerting

- Set up alerts for:
  - Authentication failure spikes (>10% increase)
  - Twilio API failures
  - Redis connection issues
  - Database connection pool exhaustion
  - JWT verification errors

---

## 8. Testing Requirements

### 8.1 Unit Tests

**Coverage Target**: 80%+ code coverage

**Required Unit Tests**:

- **Auth Service**:
  - Password hashing and verification
  - JWT token generation and validation
  - 2FA code generation and verification
  - Refresh token rotation logic

- **Lessons Service**:
  - CRUD operations with ownership validation
  - Query filtering (instrument, difficulty)
  - Soft delete behavior

- **Enrollments Service**:
  - Duplicate enrollment prevention
  - Ownership validation
  - Enrollment retrieval with filters

- **Guards**:
  - JwtAuthGuard token validation
  - RolesGuard permission checks
  - Ownership validation logic

### 8.2 Integration Tests

**Required Integration Tests**:

- **Auth Module**:
  - Complete registration flow
  - Login + 2FA + token refresh flow
  - Password change flow
  - Profile update flow

- **Lessons Module**:
  - Teacher creates lesson (authorized)
  - Student attempts to create lesson (forbidden)
  - Admin modifies any lesson (authorized)
  - Query filtering returns correct results

- **Enrollments Module**:
  - Student enrolls in lesson
  - Student views own enrollments
  - Teacher views lesson enrollments
  - Duplicate enrollment blocked

### 8.3 End-to-End (E2E) Tests

**Required E2E Tests**:

1. **Complete User Journey - Student**:
   - Register → Login → Verify 2FA → Browse Lessons → Enroll → View My Enrollments

2. **Complete User Journey - Teacher**:
   - Register → Admin changes role → Login → Verify 2FA → Create Lesson → View Enrollments

3. **Complete User Journey - Admin**:
   - Login → Change User Role → Modify Any Lesson → View All Enrollments

4. **Security Flow**:
   - Invalid credentials rejected
   - Expired JWT rejected
   - Insufficient permissions blocked
   - Rate limit enforced

5. **Password Change Flow**:
   - Request change → Verify SMS → Update password → Old token invalidated → Re-login required

### 8.4 Test Data & Mocking

- Use `@nestjs/testing` for NestJS test utilities
- Mock Twilio API in tests (no real SMS sent)
- Use in-memory Redis for tests (or docker-compose test container)
- Use separate test database with Prisma migrations
- Seed test data for E2E tests (predefined users, lessons)
- Clean up test data after each test suite

### 8.5 Testing Best Practices

- Follow Arrange-Act-Assert pattern
- Use descriptive test names: `should reject login with invalid password`
- Test edge cases: empty inputs, null values, boundary conditions
- Test error scenarios: network failures, database errors, timeout
- Use test doubles (mocks, stubs) for external dependencies
- Run tests in CI/CD pipeline before deployment

---

## 9. Open Questions

1. **SMS Delivery Reliability**: What happens if Twilio SMS fails to deliver? Should we have a fallback mechanism (email backup code)?

2. **Mobile Number Changes**: Users cannot change mobile numbers in MVP. How do we handle lost phone numbers or number changes in future?

3. **Token Expiration Policy**: Are 15-minute access tokens and 7-day refresh tokens appropriate for the use case, or should we adjust?

4. **Teacher Vetting**: Should there be an approval process for teachers before they can create lessons, or is automatic approval acceptable?

5. **Lesson Capacity Limits**: Should lessons have a maximum enrollment capacity, or unlimited students per lesson?

6. **Enrollment Withdrawal**: When a student withdraws (deletes enrollment), should there be a record retained for analytics, or hard delete?

7. **Admin User Creation**: How is the first admin user created? Manual database insertion, or a special registration endpoint?

8. **International Phone Numbers**: Should we validate phone numbers for specific countries, or accept any E.164 format?

9. **Session Management**: Should we implement active session tracking (kick out user from old devices), or allow multiple simultaneous sessions?

10. **API Versioning**: Should we implement API versioning from the start (`/api/v1/auth/login`), or add it later?

11. **Lesson Content**: The Lesson entity only has metadata (title, description). When will we add actual lesson content (videos, documents)?

12. **Prisma Migration Strategy**: For production, should we use `prisma migrate deploy` or `prisma db push`?

---

## 10. Appendix

### 10.1 API Endpoint Summary

| Method | Endpoint                        | Auth   | Roles                | Description               |
| ------ | ------------------------------- | ------ | -------------------- | ------------------------- |
| POST   | `/auth/register`                | No     | -                    | Register new user         |
| POST   | `/auth/login`                   | No     | -                    | Login with credentials    |
| POST   | `/auth/verify-2fa`              | No     | -                    | Verify SMS code           |
| POST   | `/auth/refresh-token`           | Cookie | -                    | Refresh access token      |
| GET    | `/auth/profile`                 | Yes    | All                  | Get current user profile  |
| PATCH  | `/auth/profile`                 | Yes    | All                  | Update profile            |
| POST   | `/auth/request-password-change` | Yes    | All                  | Request password change   |
| POST   | `/auth/change-password`         | No     | -                    | Change password with code |
| POST   | `/auth/logout`                  | Yes    | All                  | Logout (clear cookie)     |
| GET    | `/users/:id`                    | Yes    | Admin                | Get user by ID            |
| PATCH  | `/users/:id/role`               | Yes    | Admin                | Change user role          |
| POST   | `/lessons`                      | Yes    | Teacher, Admin       | Create lesson             |
| GET    | `/lessons`                      | No     | -                    | List all lessons (public) |
| GET    | `/lessons/:id`                  | No     | -                    | Get lesson details        |
| PATCH  | `/lessons/:id`                  | Yes    | Teacher (own), Admin | Update lesson             |
| DELETE | `/lessons/:id`                  | Yes    | Teacher (own), Admin | Delete lesson             |
| GET    | `/lessons/:id/enrollments`      | Yes    | Teacher (own), Admin | Get lesson enrollments    |
| POST   | `/enrollments`                  | Yes    | Student              | Enroll in lesson          |
| GET    | `/enrollments/my-enrollments`   | Yes    | Student              | Get my enrollments        |
| DELETE | `/enrollments/:id`              | Yes    | Student (own), Admin | Withdraw from lesson      |

### 10.2 Environment Variables

```bash
# Application
NODE_ENV=development|production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musicmaster

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-256-bit-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### 10.3 Sample API Requests

**Register**:

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "+15555551234",
  "password": "SecurePass123!"
}
```

**Login**:

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "pending2faToken": "eyJhbG...",
  "message": "SMS code sent"
}
```

**Verify 2FA**:

```bash
POST /auth/verify-2fa
Content-Type: application/json

{
  "pending2faToken": "eyJhbG...",
  "code": "123456"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Create Lesson** (Teacher):

```bash
POST /lessons
Authorization: Bearer eyJhbGciOiJIUzI1...
Content-Type: application/json

{
  "title": "Beginner Guitar - Chords & Strumming",
  "description": "Learn essential guitar chords and strumming patterns for beginners.",
  "instrument": "guitar",
  "difficultyLevel": "beginner",
  "durationMinutes": 60
}
```

**Enroll in Lesson** (Student):

```bash
POST /enrollments
Authorization: Bearer eyJhbGciOiJIUzI1...
Content-Type: application/json

{
  "lessonId": "lesson-uuid-here"
}
```

---

## 11. Timeline Estimate

| Phase                       | Duration       | Deliverables                                                |
| --------------------------- | -------------- | ----------------------------------------------------------- |
| **Setup & Infrastructure**  | 2-3 days       | Project setup, Prisma schema, Redis, Twilio config          |
| **Epic 1: Authentication**  | 5-7 days       | Registration, login, 2FA, token management, password change |
| **Epic 2: Authorization**   | 3-4 days       | Role-based guards, ownership validation, user management    |
| **Epic 3: Lessons Module**  | 4-5 days       | CRUD operations, filtering, soft delete, tests              |
| **Epic 4: Enrollments**     | 3-4 days       | Enrollment system, retrieval, ownership validation, tests   |
| **Testing & Documentation** | 3-4 days       | E2E tests, API docs, README updates                         |
| **Total**                   | **20-27 days** | Complete API with all features                              |

---

## 12. Acceptance Criteria

The feature is considered **complete** when:

✅ All functional requirements (4.1 - 4.7) are implemented and tested

✅ Unit test coverage is ≥80%

✅ All integration tests pass successfully

✅ All E2E test scenarios execute without errors

✅ Swagger API documentation is complete and accessible

✅ Twilio SMS integration works in production environment

✅ Redis session management is stable under load

✅ All endpoints return consistent error responses

✅ Rate limiting is enforced on authentication endpoints

✅ Security best practices are followed (no hardcoded secrets, HTTPS ready)

✅ README and developer documentation are updated

✅ Environment variables are documented

✅ Database migrations run successfully from scratch

---

**Document Version**: 1.0
**Created**: 2025-11-04
**Author**: MusicMaster Product Team
**Status**: Draft - Awaiting Approval
