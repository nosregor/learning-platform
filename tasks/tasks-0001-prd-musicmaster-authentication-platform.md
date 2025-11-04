# Tasks: MusicMaster Learning Platform

**Source PRD**: `0001-prd-musicmaster-authentication-platform.md`

---

## Current State Assessment

### Existing Infrastructure

- ✅ NestJS project initialized with basic structure
- ✅ Jest testing configured
- ✅ ESLint and Prettier setup
- ❌ No Prisma ORM integration
- ❌ No Redis integration
- ❌ No authentication/authorization infrastructure
- ❌ No JWT implementation
- ❌ No Twilio SMS integration
- ❌ No validation pipes (class-validator)
- ❌ No API documentation (Swagger)

### Required Dependencies

**Production**:

- `@prisma/client` - Database ORM
- `prisma` (dev) - Database toolkit
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Authentication middleware
- `passport` - Authentication framework
- `passport-jwt` - JWT strategy
- `bcrypt` - Password hashing
- `@types/bcrypt` (dev)
- `class-validator` - DTO validation
- `class-transformer` - Object transformation
- `ioredis` - Redis client
- `@types/ioredis` (dev)
- `twilio` - SMS service
- `@nestjs/config` - Configuration management
- `@nestjs/swagger` - API documentation
- `@nestjs/throttler` - Rate limiting

---

## Relevant Files

### Configuration Files

- `.env` - Environment variables (create from .env.example)
- `.env.example` - Template for environment variables
- `prisma/schema.prisma` - Database schema definition

### Common Module

- `src/common/common.module.ts` - Shared module exports
- `src/common/decorators/roles.decorator.ts` - @Roles() decorator
- `src/common/decorators/current-user.decorator.ts` - @CurrentUser() decorator
- `src/common/decorators/public.decorator.ts` - @Public() decorator
- `src/common/guards/jwt-auth.guard.ts` - JWT authentication guard
- `src/common/guards/roles.guard.ts` - Role-based authorization guard
- `src/common/filters/http-exception.filter.ts` - Global exception handler
- `src/common/interceptors/transform.interceptor.ts` - Response transformation
- `src/common/utils/password.util.ts` - Password hashing utilities
- `src/common/utils/token.util.ts` - Token generation utilities

### Database Module

- `src/database/database.module.ts` - Database module
- `src/database/prisma.service.ts` - Prisma client service
- `src/database/prisma.service.spec.ts` - Prisma service unit tests

### Authentication Module

- `src/auth/auth.module.ts` - Authentication module
- `src/auth/auth.controller.ts` - Authentication endpoints
- `src/auth/auth.controller.spec.ts` - Controller unit tests
- `src/auth/auth.service.ts` - Authentication business logic
- `src/auth/auth.service.spec.ts` - Service unit tests
- `src/auth/strategies/jwt.strategy.ts` - JWT Passport strategy
- `src/auth/dto/register.dto.ts` - Registration request DTO
- `src/auth/dto/login.dto.ts` - Login request DTO
- `src/auth/dto/verify-2fa.dto.ts` - 2FA verification DTO
- `src/auth/dto/update-profile.dto.ts` - Profile update DTO
- `src/auth/dto/change-password.dto.ts` - Password change DTO
- `src/auth/dto/auth-response.dto.ts` - Authentication response DTO
- `src/auth/services/redis.service.ts` - Redis operations for 2FA
- `src/auth/services/redis.service.spec.ts` - Redis service tests
- `src/auth/services/sms.service.ts` - Twilio SMS service
- `src/auth/services/sms.service.spec.ts` - SMS service tests

### Users Module

- `src/users/users.module.ts` - Users module
- `src/users/users.controller.ts` - User management endpoints (admin)
- `src/users/users.controller.spec.ts` - Controller unit tests
- `src/users/users.service.ts` - User management service
- `src/users/users.service.spec.ts` - Service unit tests
- `src/users/dto/update-role.dto.ts` - Role update DTO
- `src/users/dto/user-response.dto.ts` - User response DTO

### Lessons Module

- `src/lessons/lessons.module.ts` - Lessons module
- `src/lessons/lessons.controller.ts` - Lesson CRUD endpoints
- `src/lessons/lessons.controller.spec.ts` - Controller unit tests
- `src/lessons/lessons.service.ts` - Lesson business logic
- `src/lessons/lessons.service.spec.ts` - Service unit tests
- `src/lessons/dto/create-lesson.dto.ts` - Create lesson DTO
- `src/lessons/dto/update-lesson.dto.ts` - Update lesson DTO
- `src/lessons/dto/lesson-response.dto.ts` - Lesson response DTO
- `src/lessons/dto/lesson-query.dto.ts` - Query filter DTO
- `src/lessons/enums/instrument.enum.ts` - Instrument enum
- `src/lessons/enums/difficulty-level.enum.ts` - Difficulty level enum

### Enrollments Module

- `src/enrollments/enrollments.module.ts` - Enrollments module
- `src/enrollments/enrollments.controller.ts` - Enrollment endpoints
- `src/enrollments/enrollments.controller.spec.ts` - Controller unit tests
- `src/enrollments/enrollments.service.ts` - Enrollment business logic
- `src/enrollments/enrollments.service.spec.ts` - Service unit tests
- `src/enrollments/dto/create-enrollment.dto.ts` - Create enrollment DTO
- `src/enrollments/dto/enrollment-response.dto.ts` - Enrollment response DTO

### E2E Tests

- `test/auth.e2e-spec.ts` - Authentication flow E2E tests
- `test/lessons.e2e-spec.ts` - Lessons module E2E tests
- `test/enrollments.e2e-spec.ts` - Enrollments module E2E tests
- `test/authorization.e2e-spec.ts` - Authorization flow E2E tests

### Notes

- All unit test files should be placed alongside the source files (e.g., `auth.service.ts` and `auth.service.spec.ts`)
- Use `bun test` or `npm test` to run all tests
- Use `bun test:e2e` or `npm run test:e2e` to run E2E tests
- Use `bun test:cov` or `npm run test:cov` to check code coverage

---

## Tasks

- [ ] **1.0 Setup Infrastructure & Dependencies**
  - [x] 1.1 Install required npm packages for authentication (@nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt, @types/bcrypt)
  - [x] 1.2 Install Prisma ORM packages (@prisma/client, prisma as dev dependency)
  - [x] 1.3 Install validation packages (class-validator, class-transformer)
  - [x] 1.4 Install Redis client (ioredis, @types/ioredis)
  - [x] 1.5 Install Twilio SDK (twilio)
  - [ ] 1.6 Install configuration packages (@nestjs/config)
  - [ ] 1.7 Install API documentation (@nestjs/swagger)
  - [ ] 1.8 Install rate limiting (@nestjs/throttler)
  - [ ] 1.9 Create `.env.example` file with all required environment variables (DATABASE_URL, REDIS_HOST, REDIS_PORT, JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
  - [ ] 1.10 Create `.env` file from `.env.example` (add to .gitignore if not already)
  - [ ] 1.11 Update `src/main.ts` to configure global validation pipe, Swagger documentation, CORS, and rate limiting

- [ ] **2.0 Database Schema & Prisma Setup**
  - [ ] 2.1 Initialize Prisma with `bunx prisma init` (or `npx prisma init`)
  - [ ] 2.2 Create `prisma/schema.prisma` with database configuration (PostgreSQL)
  - [ ] 2.3 Define `User` model with fields: id (UUID), name, email (unique), mobileNumber (unique), passwordHash, role (enum: student, teacher, admin), createdAt, updatedAt
  - [ ] 2.4 Define `Role` enum (STUDENT, TEACHER, ADMIN)
  - [ ] 2.5 Define `Lesson` model with fields: id (UUID), title, description, instrument (enum), difficultyLevel (enum), durationMinutes, creatorId (relation to User), deletedAt (nullable), createdAt, updatedAt
  - [ ] 2.6 Define `Instrument` enum (PIANO, GUITAR, VIOLIN, DRUMS, VOCALS, OTHER)
  - [ ] 2.7 Define `DifficultyLevel` enum (BEGINNER, INTERMEDIATE, ADVANCED)
  - [ ] 2.8 Define `Enrollment` model with fields: id (UUID), studentId (relation to User), lessonId (relation to Lesson), enrolledAt, createdAt, updatedAt, unique constraint on (studentId, lessonId)
  - [ ] 2.9 Add indexes to User model on email and mobileNumber
  - [ ] 2.10 Add indexes to Lesson model on creatorId and deletedAt
  - [ ] 2.11 Add indexes to Enrollment model on studentId and lessonId
  - [ ] 2.12 Run `bunx prisma migrate dev --name init` to create initial migration
  - [ ] 2.13 Run `bunx prisma generate` to generate Prisma Client
  - [ ] 2.14 Create `src/database/database.module.ts` to export database module
  - [ ] 2.15 Create `src/database/prisma.service.ts` implementing OnModuleInit and OnModuleDestroy for connection management
  - [ ] 2.16 Write unit tests for `src/database/prisma.service.spec.ts`

- [ ] **3.0 Common Module (Shared Resources)**
  - [ ] 3.1 Create `src/common/common.module.ts` as a global module
  - [ ] 3.2 Create `src/common/decorators/roles.decorator.ts` - Custom @Roles() decorator for role-based access
  - [ ] 3.3 Create `src/common/decorators/current-user.decorator.ts` - Extract current user from request
  - [ ] 3.4 Create `src/common/decorators/public.decorator.ts` - Mark routes as public (skip JWT guard)
  - [ ] 3.5 Create `src/common/guards/jwt-auth.guard.ts` - Extends AuthGuard('jwt') with @Public() support
  - [ ] 3.6 Create `src/common/guards/roles.guard.ts` - Check user role against @Roles() decorator
  - [ ] 3.7 Create `src/common/filters/http-exception.filter.ts` - Global exception filter for consistent error responses
  - [ ] 3.8 Create `src/common/interceptors/transform.interceptor.ts` - Transform response format (optional)
  - [ ] 3.9 Create `src/common/utils/password.util.ts` - Functions for hashing and comparing passwords with bcrypt (cost factor 10)
  - [ ] 3.10 Create `src/common/utils/token.util.ts` - Generate random tokens/codes for 2FA
  - [ ] 3.11 Export all decorators, guards, filters, interceptors, and utilities from common.module.ts
  - [ ] 3.12 Register common module as global in app.module.ts

- [ ] **4.0 Authentication Module (Epic 1)**
  - [ ] 4.1 Generate auth module with `nest g module auth`
  - [ ] 4.2 Generate auth controller with `nest g controller auth`
  - [ ] 4.3 Generate auth service with `nest g service auth`
  - [ ] 4.4 Create `src/auth/services/redis.service.ts` for Redis operations (store/retrieve 2FA codes with TTL)
  - [ ] 4.5 Write unit tests for `src/auth/services/redis.service.spec.ts`
  - [ ] 4.6 Create `src/auth/services/sms.service.ts` for Twilio SMS integration (send verification codes)
  - [ ] 4.7 Write unit tests for `src/auth/services/sms.service.spec.ts` (mock Twilio client)
  - [ ] 4.8 Create `src/auth/strategies/jwt.strategy.ts` - Passport JWT strategy to validate tokens and attach user to request
  - [ ] 4.9 Create `src/auth/dto/register.dto.ts` - Validation for name, email, mobileNumber, password (class-validator decorators)
  - [ ] 4.10 Create `src/auth/dto/login.dto.ts` - Validation for email and password
  - [ ] 4.11 Create `src/auth/dto/verify-2fa.dto.ts` - Validation for pending2faToken and code
  - [ ] 4.12 Create `src/auth/dto/update-profile.dto.ts` - Validation for name and email (optional fields)
  - [ ] 4.13 Create `src/auth/dto/change-password.dto.ts` - Validation for passwordChangeToken, code, and newPassword
  - [ ] 4.14 Create `src/auth/dto/auth-response.dto.ts` - Response format for authentication endpoints
  - [ ] 4.15 Implement `POST /auth/register` endpoint in auth.controller.ts
  - [ ] 4.16 Implement registration logic in auth.service.ts (validate uniqueness, hash password, create user with role=STUDENT)
  - [ ] 4.17 Implement `POST /auth/login` endpoint in auth.controller.ts with @Public() decorator
  - [ ] 4.18 Implement login logic in auth.service.ts (verify credentials, generate 6-digit code, store in Redis with 5min TTL, send SMS, return pending2faToken)
  - [ ] 4.19 Implement `POST /auth/verify-2fa` endpoint in auth.controller.ts with @Public() decorator
  - [ ] 4.20 Implement 2FA verification logic in auth.service.ts (validate code, track attempts max 3, generate JWT access token, generate refresh token, return tokens)
  - [ ] 4.21 Implement `POST /auth/refresh-token` endpoint in auth.controller.ts with @Public() decorator (reads refresh token from HTTP-only cookie)
  - [ ] 4.22 Implement refresh token logic in auth.service.ts (validate refresh token, generate new access token)
  - [ ] 4.23 Implement `GET /auth/profile` endpoint in auth.controller.ts (protected with JwtAuthGuard)
  - [ ] 4.24 Implement get profile logic in auth.service.ts (return user data excluding passwordHash)
  - [ ] 4.25 Implement `PATCH /auth/profile` endpoint in auth.controller.ts (protected with JwtAuthGuard)
  - [ ] 4.26 Implement update profile logic in auth.service.ts (update name and/or email, validate email uniqueness)
  - [ ] 4.27 Implement `POST /auth/request-password-change` endpoint in auth.controller.ts (protected with JwtAuthGuard)
  - [ ] 4.28 Implement request password change logic in auth.service.ts (generate 6-digit code, store in Redis, send SMS, return passwordChangeToken)
  - [ ] 4.29 Implement `POST /auth/change-password` endpoint in auth.controller.ts with @Public() decorator
  - [ ] 4.30 Implement change password logic in auth.service.ts (verify code, update passwordHash, invalidate all user tokens - implement token version or blacklist)
  - [ ] 4.31 Implement `POST /auth/logout` endpoint in auth.controller.ts (protected with JwtAuthGuard)
  - [ ] 4.32 Implement logout logic in auth.service.ts (clear refresh token cookie, optionally blacklist token)
  - [ ] 4.33 Add Swagger decorators to all auth endpoints (@ApiTags, @ApiOperation, @ApiResponse)
  - [ ] 4.34 Write unit tests for auth.service.ts (test all methods with mocked dependencies)
  - [ ] 4.35 Write unit tests for auth.controller.ts (test request/response handling)
  - [ ] 4.36 Write integration tests for auth module (test registration → login → 2FA → profile update → password change flows)

- [ ] **5.0 Authorization & User Management (Epic 2)**
  - [ ] 5.1 Generate users module with `nest g module users`
  - [ ] 5.2 Generate users controller with `nest g controller users`
  - [ ] 5.3 Generate users service with `nest g service users`
  - [ ] 5.4 Create `src/users/dto/update-role.dto.ts` - Validation for role updates
  - [ ] 5.5 Create `src/users/dto/user-response.dto.ts` - User response format (exclude sensitive fields)
  - [ ] 5.6 Implement `GET /users/:id` endpoint in users.controller.ts (protected with @Roles('ADMIN'))
  - [ ] 5.7 Implement get user by ID logic in users.service.ts
  - [ ] 5.8 Implement `PATCH /users/:id/role` endpoint in users.controller.ts (protected with @Roles('ADMIN'))
  - [ ] 5.9 Implement update user role logic in users.service.ts (validate role enum, update user)
  - [ ] 5.10 Update JwtAuthGuard to use APP_GUARD provider to apply globally
  - [ ] 5.11 Update RolesGuard to use APP_GUARD provider to apply globally (should run after JwtAuthGuard)
  - [ ] 5.12 Test that @Public() decorator bypasses JWT guard
  - [ ] 5.13 Test that @Roles() decorator enforces role-based access
  - [ ] 5.14 Add Swagger decorators to users endpoints
  - [ ] 5.15 Write unit tests for users.service.ts
  - [ ] 5.16 Write unit tests for users.controller.ts
  - [ ] 5.17 Write integration tests for users module (test admin access, forbidden access for non-admins)

- [ ] **6.0 Lessons Module (Epic 3)**
  - [ ] 6.1 Generate lessons module with `nest g module lessons`
  - [ ] 6.2 Generate lessons controller with `nest g controller lessons`
  - [ ] 6.3 Generate lessons service with `nest g service lessons`
  - [ ] 6.4 Create `src/lessons/enums/instrument.enum.ts` - Export Instrument enum (PIANO, GUITAR, VIOLIN, DRUMS, VOCALS, OTHER)
  - [ ] 6.5 Create `src/lessons/enums/difficulty-level.enum.ts` - Export DifficultyLevel enum (BEGINNER, INTERMEDIATE, ADVANCED)
  - [ ] 6.6 Create `src/lessons/dto/create-lesson.dto.ts` - Validation for title (3-200 chars), description (10-2000 chars), instrument (enum), difficultyLevel (enum), durationMinutes (15-240)
  - [ ] 6.7 Create `src/lessons/dto/update-lesson.dto.ts` - Partial update DTO (all fields optional)
  - [ ] 6.8 Create `src/lessons/dto/lesson-response.dto.ts` - Lesson response format with creator info
  - [ ] 6.9 Create `src/lessons/dto/lesson-query.dto.ts` - Query parameters for filtering (instrument, difficulty, pagination)
  - [ ] 6.10 Implement `POST /lessons` endpoint in lessons.controller.ts (protected with @Roles('TEACHER', 'ADMIN'))
  - [ ] 6.11 Implement create lesson logic in lessons.service.ts (set creatorId from current user)
  - [ ] 6.12 Implement `GET /lessons` endpoint in lessons.controller.ts with @Public() decorator
  - [ ] 6.13 Implement get all lessons logic in lessons.service.ts (support query filters for instrument and difficulty, pagination, exclude soft-deleted lessons)
  - [ ] 6.14 Implement `GET /lessons/:id` endpoint in lessons.controller.ts with @Public() decorator
  - [ ] 6.15 Implement get lesson by ID logic in lessons.service.ts (exclude soft-deleted, include creator info)
  - [ ] 6.16 Implement `PATCH /lessons/:id` endpoint in lessons.controller.ts (protected with @Roles('TEACHER', 'ADMIN'))
  - [ ] 6.17 Implement update lesson logic in lessons.service.ts (check ownership: if TEACHER, verify creatorId === currentUser.id; if ADMIN, allow)
  - [ ] 6.18 Implement `DELETE /lessons/:id` endpoint in lessons.controller.ts (protected with @Roles('TEACHER', 'ADMIN'))
  - [ ] 6.19 Implement soft delete lesson logic in lessons.service.ts (set deletedAt timestamp, check ownership same as update)
  - [ ] 6.20 Add Swagger decorators to all lessons endpoints
  - [ ] 6.21 Write unit tests for lessons.service.ts (test CRUD operations, ownership validation, filtering)
  - [ ] 6.22 Write unit tests for lessons.controller.ts
  - [ ] 6.23 Write integration tests for lessons module (test teacher creates/updates/deletes own lesson, student cannot create, admin can modify any)

- [ ] **7.0 Enrollments Module (Epic 3)**
  - [ ] 7.1 Generate enrollments module with `nest g module enrollments`
  - [ ] 7.2 Generate enrollments controller with `nest g controller enrollments`
  - [ ] 7.3 Generate enrollments service with `nest g service enrollments`
  - [ ] 7.4 Create `src/enrollments/dto/create-enrollment.dto.ts` - Validation for lessonId (UUID)
  - [ ] 7.5 Create `src/enrollments/dto/enrollment-response.dto.ts` - Enrollment response with lesson and student details
  - [ ] 7.6 Implement `POST /enrollments` endpoint in enrollments.controller.ts (protected with @Roles('STUDENT'))
  - [ ] 7.7 Implement create enrollment logic in enrollments.service.ts (set studentId from current user, check lesson exists, prevent duplicates with unique constraint, set enrolledAt timestamp)
  - [ ] 7.8 Handle duplicate enrollment error (catch Prisma unique constraint violation, return 409 Conflict)
  - [ ] 7.9 Implement `GET /enrollments/my-enrollments` endpoint in enrollments.controller.ts (protected with @Roles('STUDENT'))
  - [ ] 7.10 Implement get my enrollments logic in enrollments.service.ts (filter by studentId === currentUser.id, include lesson details)
  - [ ] 7.11 Implement `GET /lessons/:id/enrollments` endpoint in lessons.controller.ts (protected with @Roles('TEACHER', 'ADMIN'))
  - [ ] 7.12 Implement get lesson enrollments logic in enrollments.service.ts (check ownership: if TEACHER, verify lesson.creatorId === currentUser.id; if ADMIN, allow; include student details excluding sensitive fields)
  - [ ] 7.13 Implement `DELETE /enrollments/:id` endpoint in enrollments.controller.ts (protected with @Roles('STUDENT', 'ADMIN'))
  - [ ] 7.14 Implement delete enrollment logic in enrollments.service.ts (check ownership: if STUDENT, verify enrollment.studentId === currentUser.id; if ADMIN, allow)
  - [ ] 7.15 Add Swagger decorators to all enrollments endpoints
  - [ ] 7.16 Write unit tests for enrollments.service.ts (test enrollment creation, duplicate prevention, ownership validation)
  - [ ] 7.17 Write unit tests for enrollments.controller.ts
  - [ ] 7.18 Write integration tests for enrollments module (test student enrolls, views own enrollments, teacher views lesson enrollments, duplicate prevention)

- [ ] **8.0 Integration, Testing & Documentation**
  - [ ] 8.1 Create `test/auth.e2e-spec.ts` - E2E test for complete authentication flow (register → login → verify 2FA → refresh token → profile update → password change → logout)
  - [ ] 8.2 Create `test/authorization.e2e-spec.ts` - E2E test for role-based access (student/teacher/admin access to different endpoints)
  - [ ] 8.3 Create `test/lessons.e2e-spec.ts` - E2E test for lesson CRUD (teacher creates lesson, student views, admin modifies, filtering works)
  - [ ] 8.4 Create `test/enrollments.e2e-spec.ts` - E2E test for enrollment flow (student enrolls, views enrollments, teacher views lesson enrollments, withdrawal)
  - [ ] 8.5 Create `test/security.e2e-spec.ts` - E2E test for security features (rate limiting, invalid tokens, insufficient permissions)
  - [ ] 8.6 Setup test database and Redis for E2E tests (use separate DATABASE_URL and REDIS_PORT in test environment)
  - [ ] 8.7 Create test utilities for seeding data (create test users with different roles, test lessons)
  - [ ] 8.8 Verify all E2E tests pass
  - [ ] 8.9 Run `bun test:cov` to ensure 80%+ code coverage
  - [ ] 8.10 Complete Swagger documentation for all endpoints (add examples, descriptions, response schemas)
  - [ ] 8.11 Configure Swagger UI authentication (add JWT bearer auth button)
  - [ ] 8.12 Update README.md with project overview, setup instructions, API documentation link
  - [ ] 8.13 Add section to README for running migrations (`bunx prisma migrate dev`)
  - [ ] 8.14 Add section to README for starting Redis (`docker run -d -p 6379:6379 redis`)
  - [ ] 8.15 Add section to README for starting PostgreSQL (docker-compose or connection instructions)
  - [ ] 8.16 Document all environment variables in README
  - [ ] 8.17 Add API endpoint summary table to README
  - [ ] 8.18 Create `docker-compose.yml` for local development (PostgreSQL + Redis)
  - [ ] 8.19 Test the entire application end-to-end manually using Swagger UI or Postman
  - [ ] 8.20 Fix any remaining linting errors (`bun run lint`)
  - [ ] 8.21 Format all code (`bun run format`)

---

**Status**: ✅ Complete task list generated with sub-tasks and relevant files.
