# Inventory Events Service 📦

## Overview
The **Inventory Events Service** is a specialized microservice responsible for consuming, validating, and persisting inventory-related events. It acts as an analytics and history tracker for all stock movements within the system, ensuring data integrity and observability.

### Key Features:
* **Kafka Integration:** Listens to inventory change events in real-time.
* **Idempotency:** Ensures no duplicate events are saved by using unique Event IDs as primary keys.
* **Resilience:** Implements a robust Retry mechanism and a Dead Letter Topic (DLT) for failed messages.
* **API Documentation:** Fully documented with Swagger/OpenAPI for easy exploration.

---

## System Architecture
The service sits between the message broker (Kafka) and the persistent storage (PostgreSQL).

1.  **Producer:** `Inventory-Service` sends a message to the `inventory.events` topic.
2.  **Consumer:** This service picks up the message, maps it to an Entity, and performs validation.
3.  **Storage:** Data is persisted in the `inventory_event` table for historical tracking.

---

## Technical Stack
* **Java 17** & **Spring Boot 4.x**
* **Spring Data JPA** (PostgreSQL)
* **Spring Kafka**
* **Flyway** (Database Migrations)
* **Lombok** (Boilerplate reduction)
* **Testcontainers / EmbeddedKafka** (Integration Testing)

---

## Kafka Configuration

### Main Topic
* **Name:** `inventory.events`
* **Consumer Group:** `inventory-events-group`

### Error Handling & DLT
In case of a processing failure (e.g., database constraint violation or malformed data), the following policy is applied:
1.  **Retries:** 3 attempts (Initial + 2 retries) with a 1-second (1000ms) fixed backoff.
2.  **Dead Letter Topic (DLT):** If all retries fail, the message is automatically moved to:
    * **Topic Name:** `inventory.events.dlt`
    * **Purpose:** Manual inspection, debugging, and potential reprocessing via Kafka UI.

---

## API Documentation
Once the service is running, you can access the interactive API documentation and test endpoints:

* **Swagger UI:** [http://localhost:8088/swagger-ui.html](http://localhost:8088/swagger-ui.html)
* **OpenAPI Specs:** [http://localhost:8088/v3/api-docs](http://localhost:8088/v3/api-docs)

---

## Development & Testing

### Running the Service Locally
Make sure your Docker infrastructure (Kafka & Postgres) is running:

```bash
# Navigate to the infra folder and start containers
docker-compose up -d

# Run the Spring Boot application
mvn spring-boot:run
```

### Running Tests
The project includes comprehensive integration tests that utilize an **Embedded Kafka** broker and H2/Testcontainers:

```bash
mvn test
```


## Environment Variables
The following variables can be overridden in `application.properties` or via OS environment variables:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | Kafka broker addresses | `kafka:9092` |
| `SPRING_DATASOURCE_URL` | PostgreSQL connection string | `jdbc:postgresql://localhost:5435/inventory_events_db` |
| `SERVER_PORT` | Port of this service | `8088` |
