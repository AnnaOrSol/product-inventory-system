# Product Inventory System 🏠📦
A full-stack, microservices-based home inventory management system.

Manage your household inventory, add products manually or via barcode scan, create missing products in a global catalog, detect products from photos using an embedded YOLOv8 model, and generate a shopping list based on required items that are missing from inventory—then share it via WhatsApp.

---

## ✨ Key Features
- **Add existing products to inventory**
  - Manual search
  - **Barcode scanning**
- **Add new products** to the global product catalog (when not found)
- **AI product detection from photos**
  - YOLOv8 model (trained and integrated into the frontend flow)
- **Smart shopping list generation**
  - Compare **required items** vs. current inventory
  - Send shopping list to **WhatsApp**

---

## 🧱 Architecture (High Level)
This system is built as microservices communicating via REST:

- **Product Service (Global Catalog)**
  - Stores all products available in the system (not tied to a specific home/installation)
- **Inventory Service (Core Domain)**
  - Manages “installations” (each installation = a home)
  - Stores inventory items per installation
  - Stores “required items” per installation (minimum household requirements)

**Frontend** communicates with the backend via REST.  
**Database**: PostgreSQL.  
**Containerization**: Docker.


---

## 🛠 Tech Stack
- **Backend**: Java, Spring Boot
- **Frontend**: TypeScript (React)
- **Database**: PostgreSQL
- **Infra**: Docker / Docker Compose

---

## 📁 Repository Structure
├── backend/ # Spring Boot services (Product + Inventory)

├── frontend/home-inventory-ui/ # React + TypeScript UI

└── infra/ # Docker / Compose / infra-related configs

---

## 🚀 Getting Started

### Prerequisites
- Docker + Docker Compose
- Java 17+ (if running services locally)
- Node.js 18+ (if running frontend locally)

### 1) Clone
```bash
git clone https://github.com/AnnaOrSol/product-inventory-system.git
cd product-inventory-system
```
### 2) Run with Docker (Recommended)
If you already have a docker-compose.yml under infra/, run it from there.
Update the command below to match your actual compose filename/path.
```bash
cd infra
docker compose up --build
```
#### Then open:
Frontend: http://localhost:XXXX
Inventory Service: http://localhost:XXXX
Product Service: http://localhost:XXXX
Replace XXXX with the ports configured in your project.

### 3) Run Locally (Dev Mode)
#### Backend
Open two terminals (one per service), then run each Spring Boot service.
Examples (adjust to your module names):
```bash
cd backend
# ./mvnw spring-boot:run
# or run via IntelliJ
```
#### Frontend
```bash
cd frontend/home-inventory-ui
npm install
npm run dev
```

---

## ⚙️ Configuration
Create environment variables as needed (examples below—adjust to your code):
#### Backend (examples)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/<db>
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
#### Frontend (examples)
VITE_INVENTORY_API_BASE_URL=http://localhost:XXXX
VITE_PRODUCT_API_BASE_URL=http://localhost:XXXX

---

## 🔌 API Overview (Example)
Replace endpoint names with the real ones from your controllers.
#### Product Service
GET /products?query=milk

POST /products (create new global product)

GET /products/barcode/{barcode}

#### Inventory Service
POST /installations (create a home)

POST /installations/{id}/inventory-items

POST /installations/{id}/required-items

GET /installations/{id}/shopping-list

---
## AI Product Detection (YOLOv8)
The system supports detecting products from images using a trained YOLOv8 model.
High-level flow:
User opens camera
Frontend runs detection on live
Detected product candidates can be added to the inventory with user's confirmation

## WhatsApp Shopping List
The system can generate a shopping list by comparing:
Required items (per home) ✅
Current inventory items ❌
Then it sends/shares the list via WhatsApp.

---
## 🗺 Future Roadmap:
 1. Add authentication + user accounts (instead of working with installations), develop settings page.
 2. Smart Expiry Predictions: Use Machine Learning to predict when a product is likely to run out based on historical household consumption patterns.
 3. Improve AI detection UX (add more products to detect, improve detection)
 4. Observability (central logs, metrics)
 5. Event-Driven Communication: Replace synchronous REST calls between services with Apache Kafka to improve system resilience.
