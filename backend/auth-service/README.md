# 🔐 Auth Service

The identity and security backbone of the Smart Inventory System. This microservice manages user registration, secure password storage, and **JWT (JSON Web Token)** issuance.

---

## 🚀 Overview

The Auth Service is a **Stateless** authentication provider. It uses phone numbers as the primary unique identifier for users, ensuring a mobile-friendly and secure entry point to the entire system.

### Key Technologies:
* **Spring Security:** For securing endpoints and handling the authentication lifecycle.
* **JJWT (Java JWT):** For generating secure, signed tokens.
* **BCrypt:** For high-security password hashing.
* **Flyway:** For version-controlled database migrations.
* **PostgreSQL:** As the primary identity store.

---

## 🛠 Features

* **Phone-based Auth:** Normalizes and uses phone numbers for login.
* **Secure Registration:** Validates unique emails and phone numbers before saving.
* **JWT Issuance:** Provides Bearer tokens containing user metadata (`id`, `name`, `phone`).
* **Stateless Architecture:** No session storage, allowing easy horizontal scaling.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Creates a new user account | No |
| `POST` | `/auth/login` | Authenticates user and returns JWT | No |

### Sample Request: Register
```json
{
  "name": "Israel Israeli",
  "email": "israel@example.com",
  "phone": "050-1234567",
  "password": "StrongPassword123"
}
```

### Sample Response: Login
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": "uuid-string",
  "userName": "Israel Israeli",
  "phone": "0501234567"
}
```

## 🔒 Security Implementation
### JWT Structure
The issued tokens are signed using the `HS256` algorithm and contain the following claims:

* `sub`: User UUID

* `phone`: Normalized phone number

* `name`: Full name of the user

* `iat`: Issued-at timestamp

* `exp`: Expiration timestamp (Default: 1 hour)

### Authentication Flow
**User Login:** Client sends phone and password.

**AuthenticationManager:** Validates credentials via `CustomUserDetailsService` and `BCrypt`.

**Token Generation:** `JwtService` builds a signed token.

**Gateway Validation:** (Internal) The API Gateway validates this token for all subsequent requests to other services.

### 📂 Database Schema
Managed by **Flyway**. The `users` table includes:

* `id` (UUID, Primary Key)

* `name` (VARCHAR 100)

* `email` (VARCHAR 255, Unique)

* `phone` (VARCHAR 20, Unique)

* `password_hash` (VARCHAR 255)

* `role` (VARCHAR 50)

* `created_at`, `updated_at` (Timestamps)
