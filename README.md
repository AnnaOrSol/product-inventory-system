# 🏠 Smart Inventory Management System (Full-Stack & AI-Integrated)

A sophisticated, enterprise-grade distributed platform for managing household and office inventories. This system combines **Microservices Architecture**, **Real-time Event Streaming**, and **Computer Vision (AI)** to provide a seamless inventory tracking experience.

---

## 🏗 System Architecture

The system is built on a highly scalable Microservices Architecture. All client-side communication is routed through a centralized API Gateway, ensuring security and unified entry points.

### 🛰 Backend Services (The "Brain")

1.  **Gateway Service:** * The single entry point for the Frontend (including **Login**).
    * Handles dynamic routing to internal microservices.
2.  **Auth Service:** * Manages user identities and security.
    * Implements **JWT (JSON Web Tokens)** for stateless authentication.
3.  **Product Service (Global Catalog & Recognition):** * Manages a dual-layer catalog: **Generic products** (e.g., "Milk") and **Branded products** (e.g., "Tnuva Milk 5%").
    * Supports **Barcode-based lookups** for rapid item identification.
4.  **Inventory Service (Core Logic):** * **Multi-Installation Support:** Manages stock for different locations (Home, Office, etc.).
    * **Shopping List Engine:** Automatically calculates gaps between current stock and mandatory requirements.
    * **Shared Notes:** Real-time virtual "fridge notes" shared among installation members.
    * **Event Producer:** Streams every inventory change to Kafka for asynchronous processing.
5.  **Inventory Events Service (Analytics & Audit):** * **Kafka Consumer:** Listens to the `inventory.events` topic.
    * Persists a granular history of every product movement for future AI-driven consumption analytics.

### 💻 Frontend (The "Client" & AI Engine)
A modern Web/Mobile interface that acts as the primary interaction layer. 
* **Edge AI Integration:** Implements a custom-trained **YOLOv8** model directly in the browser/client to identify grocery items from live camera feeds or photos.
* **Scan-to-Add:** Utilizes camera integration for both AI recognition and Barcode scanning.

---

## 🌟 Advanced Features & Tech Highlights

* **Computer Vision (YOLOv8):** Custom-trained model integrated into the Frontend to transform visual data into actionable inventory updates.
* **Event-Driven Resiliency:** Using **Apache Kafka** to decouple the core inventory logic from history and analytics, ensuring high performance.
* **Database Versioning (Flyway):** All PostgreSQL schemas are managed via **Flyway Migrations**, ensuring consistent and reproducible database states across development and production.
* **Idempotent Processing:** Ensures that network retries in Kafka do not result in duplicate historical records.

---

## 🚦 Request Lifecycle

1.  **Security:** Frontend → **Gateway** → **Auth Service** (JWT Issue).
2.  **Action:** Frontend (JWT) → **Gateway** → **Target Service** (Inventory/Product).
3.  **Streaming:** Inventory Service → **Kafka** → Inventory Events Service (History Persistence).

---

## 🛠 Tech Stack

* **Backend:** Java 17, Spring Boot 3, Spring Cloud Gateway, Spring Security.
* **Messaging:** Apache Kafka.
* **Data Persistence:** PostgreSQL, **Flyway**.
* **Infrastructure:** Docker & Docker Compose.
### 💻 Frontend
* **Framework:** React 19 (TypeScript) with Vite.
* **Styling:** Tailwind CSS 4, Radix UI, Lucide Icons.
* **AI Engine:** TensorFlow.js (Running custom YOLOv8 model for object detection).
* **Scanning:** HTML5-QRCode for real-time barcode processing.
* **State & Routing:** React Router 7, Sonner (Notifications).
---

## 📂 Project Structure

```text
.
├── gateway-service/           # API Gateway & Routing
├── auth-service/              # JWT Auth & User Management
├── product-service/           # Catalog, Barcodes & AI metadata
├── inventory-service/         # Stock Logic, Notes & Shopping List (Producer)
├── inventory-events-service/  # Audit Log & Analytics (Consumer)
├── frontend/                  # Client App with YOLOv8 Integration
├── infra/                     # Docker Compose, Kafka & DB Configs
└── README.md                  # This file
```

## 🚀 Getting Started

### 1. Full System Launch (Backend)
The entire backend ecosystem, including all 5 microservices, databases, and Kafka, is containerized. To launch the complete system, run:

```bash
cd infra
docker-compose up -d
```

### 2. Frontend Launch
Once the backend is healthy, start the client application:
```bash
cd frontend
npm install
npm start
```

### 3. Verification
**API Gateway:** Reachable at http://localhost:8087 (or your chosen port).

**Kafka UI:** Access http://localhost:8090 to monitor events.

**YOLOv8:** Ensure your camera permissions are enabled in the browser for product recognition.
