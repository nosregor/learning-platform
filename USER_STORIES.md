Perfect — here’s your **MusicMaster Platform Epics**, structured for **Phase 1 (Authentication & 2FA)** and **Phase 2 (Authorization & Role-Based Access)**.

I’ve written them in the same clear, product-style format as before, but tailored for your goal: first mastering **authentication (with SMS 2FA)**, then adding **authorization** for **student**, **teacher**, and **admin** roles.

---

# 🎵 MusicMaster Platform — Epics for Authentication & Authorization

---

## 🧭 **Epic 1: User Authentication & 2FA**

### 🎯 Goal

Implement secure user registration, login, and password management with SMS-based two-factor authentication.

---

### **User Stories**

#### 👤 Registration

- As a **user**, I can register with my **name**, **email**, **mobile number**, and **password** to create an account.
- The system validates the inputs, ensures the mobile number is unique, and hashes the password before saving.
- The user’s **role** defaults to _student_ unless changed later by an admin.

#### 🔐 Login with Password & 2FA

- As a **user**, I can log in using my **email** and **password**.
- If credentials are valid, the system generates a temporary 2FA token and sends a **verification code via SMS** (e.g., through Twilio).
- The user must confirm the 2FA code via `/verify-2fa` to receive full access.

#### 🧾 2FA Verification

- As a **user**, I can submit the received SMS code to the `/verify-2fa` endpoint.
- Upon success, I receive an **access token (JWT)** and a **refresh token (HTTP-only cookie)** for secure session handling.
- If verification fails multiple times, the session is invalidated.

#### 🔁 Token Refresh

- As a **user**, I can refresh my session using the refresh token without re-entering my credentials.
- The refresh token can be rotated for extra security.

#### ✏️ Profile Management

- As a **user**, I can update my **name** and **email** through the `/profile` endpoint.
- I **cannot change** my **mobile number**, as it’s tied to 2FA.
- Changes are reflected in my JWT payload upon next login.

#### 🔑 Password Change

- As a **user**, I can change my password, but only after verifying my identity with an **SMS code**.
- After successful verification, I can submit a new password via `/change-password`.
- Changing my password invalidates old tokens.

---

### **Technical Goals**

- Implement secure password hashing (e.g., bcrypt).
- Integrate a mock or real SMS service (Twilio, Vonage, or a local simulator).
- Store minimal session state for 2FA (e.g., Redis, or ephemeral DB collection).
- Build REST endpoints for `/register`, `/login`, `/verify-2fa`, `/refresh-token`, `/profile`, and `/change-password`.
- Enforce strong input validation (e.g., class-validator).

---

## 🧩 **Epic 2: Authorization & Role-Based Access**

### 🎯 Goal

Define and enforce access control rules across all endpoints using role-based authorization for **students**, **teachers**, and **admins**.

---

### **Roles**

| Role        | Description                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| **Student** | Default role. Can browse and enroll in lessons, submit assignments, view personal progress. |
| **Teacher** | Can create, edit, and delete their own lessons, and review student submissions.             |
| **Admin**   | Full system privileges. Can manage users, lessons, and approvals.                           |

---

### **User Stories**

#### 🧑‍🎓 Student Access

- As a **student**, I can:
  - View public lessons and enroll in them.
  - Submit assignments for my enrolled lessons.
  - View only my own enrollments and submissions.
    🔒 _Authorization:_ Students can only access resources they own (`studentId === currentUser.id`).

#### 🧑‍🏫 Teacher Access

- As a **teacher**, I can:
  - Create, edit, and delete my own lessons.
  - View and grade student submissions in my lessons.
  - Manage enrollments for my lessons (e.g., approve or remove students).
    🔒 _Authorization:_ Teachers can only access or modify lessons where `creatorId === currentUser.id`.

#### 🛡️ Admin Access

- As an **admin**, I can:
  - View, edit, or delete any user, lesson, or submission.
  - Approve or reject teacher registration requests.
  - Reset passwords or change roles for any user.
    🔒 _Authorization:_ Admin bypasses ownership; has global access.

---

### **Technical Goals**

- Add a `role` field to the `User` entity (`student`, `teacher`, `admin`).
- Implement **role-based guards** (`RolesGuard`, `@Roles()` decorator).
- Attach `role` information to the JWT payload.
- Protect routes with role-specific guards:
  - `/lessons` → `@Roles('teacher', 'admin')`
  - `/assignments` → `@Roles('teacher', 'admin')`
  - `/enrollments` → `@Roles('student', 'admin')`
  - `/users` → `@Roles('admin')`

- Add middleware or guards to check ownership (e.g., only teachers can modify their lessons).

---

## 🧱 **Epic 3: Integration of Authentication + Authorization**

### 🎯 Goal

Combine both systems so that role-based access control depends on a valid authenticated identity.

---

### **User Stories**

- As a **logged-in user**, my JWT includes a role claim (`role: 'teacher'`), which determines accessible routes.
- As a **teacher**, I can only access `/lessons` routes after successful 2FA login.
- As an **admin**, I can view moderation dashboards only when authenticated and authorized.
- If my JWT expires, I must re-authenticate via `/verify-2fa`.

---

### **Technical Goals**

- Secure all protected routes with `JwtAuthGuard` + `RolesGuard`.
- Store tokens securely (access token in memory, refresh token in HTTP-only cookie).
- Apply fine-grained route protection with both **role** and **ownership** checks.
- Ensure 2FA verification is a prerequisite to issuing JWTs with role claims.

---

## 🧠 Summary — Step-by-Step Flow

| Step | Epic                                  | Focus                                                                             |
| ---- | ------------------------------------- | --------------------------------------------------------------------------------- |
| 1️⃣   | **User Authentication & 2FA**         | Build a secure login system with SMS verification.                                |
| 2️⃣   | **Authorization & Role-Based Access** | Define roles and guard access to resources.                                       |
| 3️⃣   | **Integration Layer**                 | Combine both layers so that only verified users can act according to their roles. |

---
