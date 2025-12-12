# Supply Chain & Inventory Management System

A distributed microservices-based supply chain platform built using Spring Boot, Kafka, React, WebSockets, Email Service, Eureka Service Discovery, API Gateway and Resilience4j Circuit Breaker.

This system manages Orders, Inventory, Shipments and provides real-time notifications via WebSocket along with automated email alerts.

## 🚀 Features
✅ Microservices Architecture
Each domain runs independently:

- Order Service
- Inventory Service
- Shipment Service
- Notification Service (Kafka consumer + WebSocket broadcaster)
- Email Service (Kafka consumer + Gmail sender)
- API Gateway (Spring Cloud Gateway)
- Service Registry (Eureka Server)
- React Frontend

## 🔧 Technologies Used
### Backend
- Spring Boot 3
- Spring Cloud Gateway
- Spring Cloud Netflix Eureka
- Spring Kafka
- Resilience4j Circuit Breaker
- Spring WebSocket + STOMP
- JavaMailSender
- MySQL
- Docker (Kafka + Zookeeper)

### Frontend
- React + Vite
- React Router
- SockJS + STOMP for real-time notifications

## 🧩 Microservices Breakdown
### 1️⃣ Order Service
- Create, update, delete, view orders
- Publishes order.events to Kafka
- Uses MySQL for persistence

### 2️⃣ Inventory Service
- Track stock levels
- Update thresholds
- Adjust stock availability
- Detects low-stock conditions
- Publishes inventory.events

### 3️⃣ Shipment Service
- Create shipments
- Update shipment location
- Update shipment status
- Publishes shipment.events
  
### 4️⃣ Notification Service
- Consumes order, inventory, shipment events
- Publishes final messages to notification.email.events
- Broadcasts real-time notifications to UI using WebSocket
- Built with: Spring Kafka Consumer | SimpMessagingTemplate | STOMP WebSocket

### 5️⃣ Email Service
- Consumes notification.email.events
- Sends formatted emails via Gmail SMTP
- Handles JSON event deserialization

### 6️⃣ API Gateway
- Central entry point
- Route mapping: /api/orders, /api/inventory, /api/shipment
- Uses Resilience4j Circuit Breaker for fault tolerance
- Provides fallback responses
  
### 7️⃣ Service Registry
- Eureka Server
- Enables dynamic service discovery
- Removes need for hardcoded URLs

## 🌐 Circuit Breaker (Resilience4j)
- Implemented in API Gateway:
- Prevents failures cascading across microservices
- Provides fallback routes for each microservice
- Enhances resilience under load or service downtime
  
## 🚀 Running the Project

- Start Kafka & Zookeeper (Docker)
```bash
docker-compose up -d
```

- Start Eureka Server
```bash
ServiceRegistry
```

- Start API Gateway
```bash
ApiGateway
```

- Start backend services
```bash
OrderService
InventoryService
ShipmentService
NotificationService
EmailService
```
- Start React frontend
```bash
cd client
npm install
npm run dev
```

## 👤 Author
Tushar Ranjan
Full Stack Developer — Java | Spring Boot | React | Kafka | Microservices
