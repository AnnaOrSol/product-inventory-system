# 🚦 API Gateway Service

The central entry point and security layer for the Home Inventory System. This service handles intelligent request routing, Cross-Origin Resource Sharing (CORS), and centralized JWT authentication.

---

## 🚀 Overview

The Gateway Service acts as a **Reverse Proxy**, providing a single unified URL for the Frontend while dispatching requests to various internal microservices. It ensures that internal service architectures (ports, hostnames) remain hidden from the client.

### Key Technologies:
* **Spring Cloud Gateway (WebMVC):** Modern, flexible routing.
* **Spring Security (OAuth2 Resource Server):** Centralized JWT validation.
* **Nimbus JWT:** For high-performance token decoding.

---

## 🗺 Routing Table

The Gateway is configured to route traffic to the following internal services:

| Route ID | Path Pattern | Internal Target | Port |
| :--- | :--- | :--- | :--- |
| `auth-service` | `/auth/**` | `http://auth-service` | `8086` |
| `product-service` | `/product/**` | `http://product-service` | `8084` |
| `inventory-service` | `/inventory/**` | `http://inventory-service` | `8085` |
| `installation-service` | `/installations/**` | `http://inventory-service` | `8085` |
| `notes-service` | `/notes/**` | `http://inventory-service` | `8085` |
| `members-service` | `/installation-members/me` | `http://inventory-service` | `8085` |

### 🏥 Health Check Aliases:
The Gateway provides custom health monitoring endpoints for downstream services:
- `/inventory-health` → Proxies to `inventory-service/health`
- `/product-health` → Proxies to `product-service/health`

---

## 🔐 Security & Middleware

### 1. Centralized Authentication
The Gateway functions as an **OAuth2 Resource Server**. 
* **Public Endpoints:** `/auth/register` and `/auth/login` are accessible without a token.
* **Protected Endpoints:** All other requests require a valid **JWT (Bearer Token)**.
* **Token Validation:** The Gateway uses a shared `HMAC-SHA256` secret key to decode and verify incoming tokens before allowing them through.

### 2. Global CORS Configuration
To allow the Frontend (React/Vite) to communicate with the Backend, the Gateway is configured with a strict CORS policy:
* **Allowed Origins:** `http://localhost:5173`, `http://192.168.3.22:5173`
* **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD.
* **Credentials:** Supported (Allows sending Auth headers and cookies).

---

## ⚙️ Configuration

The service is highly configurable via `application.properties`. 

### Key Properties:
- `server.port=8087`: The public-facing port for the entire ecosystem.
- `app.jwt.secret`: Must match the secret key used in the **Auth Service**.
