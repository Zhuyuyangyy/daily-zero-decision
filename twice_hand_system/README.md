# Campus SecondHand -- Campus Secondhand Trading Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MyBatis-Plus](https://img.shields.io/badge/MyBatis--Plus-3.5.3-blue.svg)](https://baomidou.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Maven-red.svg)](https://maven.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](Dockerfile)

> A full-stack web application for campus secondhand goods trading, built with Spring Boot, MyBatis-Plus, and JWT authentication.

Campus SecondHand is a RESTful API platform that enables university students to buy and sell secondhand items within their campus community. It provides user registration and authentication, goods listing and management, and order processing with JWT-based security.

---

## Overview

University students accumulate items they no longer need at the end of each semester. Campus SecondHand provides a dedicated marketplace for campus communities where students can list items for sale, browse available goods, and complete transactions securely. The platform uses JWT token authentication to ensure only registered users can create listings and place orders.

---

## Key Features

- **User Authentication** -- JWT-based registration and login with token refresh and interceptors for secure API access.
- **Goods Management** -- Create, update, search, and delete product listings with image support.
- **Order Processing** -- Place orders, track order status, and manage transaction history.
- **Role-Based Access Control** -- Differentiated permissions for buyers and sellers.
- **Global Exception Handling** -- Centralized error handling with consistent API response format.
- **Database Auto-Fill** -- MyBatis-Plus meta-object handler for automatic timestamp and audit field population.
- **RESTful API Design** -- Clean, consistent API endpoints following REST conventions.
- **CORS Support** -- Cross-origin resource sharing enabled for frontend integration.

---

## Architecture

```
                        [Client / Browser]
                             |
                             v
                   +---------------------+
                   |  Spring Boot App    |
                   |  (REST API)         |
                   +---------------------+
                             |
            +----------------+----------------+
            |                |                |
            v                v                v
    +-------------+  +-------------+  +-------------+
    | User        |  | Goods       |  | Order       |
    | Controller  |  | Controller  |  | Controller  |
    +-------------+  +-------------+  +-------------+
            |                |                |
            v                v                v
    +-------------+  +-------------+  +-------------+
    | User        |  | Goods       |  | Order       |
    | Service     |  | Service     |  | Service     |
    +-------------+  +-------------+  +-------------+
            |                |                |
            v                v                v
    +-------------+  +-------------+  +-------------+
    | User        |  | Goods       |  | Order       |
    | Mapper      |  | Mapper      |  | Mapper      |
    +-------------+  +-------------+  +-------------+
            |                |                |
            +----------------+----------------+
                             |
                             v
                    +-----------------+
                    |   MySQL 8       |
                    |   (MyBatis-Plus)|
                    +-----------------+
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 2.7.18 |
| ORM | MyBatis-Plus 3.5.3.1 |
| Database | MySQL 8.0 |
| Authentication | JWT (jjwt 0.11.5 + java-jwt 4.4.0) |
| Validation | Spring Boot Starter Validation |
| Utilities | Lombok 1.18.30 |
| Build Tool | Maven |
| Containerization | Docker & Docker Compose |
| CI/CD | GitHub Actions |

---

## Quick Start

### Prerequisites

- JDK 17 or higher
- Maven 3.8 or higher
- MySQL 8.0 or higher

### Database Setup

Create a MySQL database named `school_secondary` and run the initialization script:

```bash
mysql -u root -p < src/main/resources/sql/init.sql
```

Configure the database connection in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/school_secondary
    username: root
    password: your_password
```

### Build and Run

```bash
# Build the project
mvn clean package -DskipTests

# Run the application
java -jar target/secondhand-0.0.1-SNAPSHOT.jar
```

Or run directly with Maven:

```bash
mvn spring-boot:run
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Verify

```bash
curl http://localhost:8080/user/login
```

---

## API Endpoints

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/user/register` | POST | Register a new user account | No |
| `/user/login` | POST | Login and receive JWT token | No |
| `/user/info` | GET | Get current user info | Yes |
| `/user/info` | PUT | Update user info | Yes |

### Goods

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/goods/list` | GET | List all on-sale goods | No |
| `/goods/detail/{id}` | GET | Get goods detail by ID | No |
| `/goods/my` | GET | Get current user's goods | Yes |
| `/goods/create` | POST | Create a new goods listing | Yes |
| `/goods/update` | PUT | Update an existing listing | Yes |
| `/goods/delete/{id}` | DELETE | Delete a listing | Yes |

### Orders

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/order/create` | POST | Place a new order | Yes |
| `/order/my/buy` | GET | List buyer's orders | Yes |
| `/order/my/sell` | GET | List seller's orders | Yes |
| `/order/status/{id}` | PUT | Update order status | Yes |

### Request/Response Examples

**Register:**
```bash
curl -X POST http://localhost:8080/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","nickname":"Test","phone":"13800138000"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
```

**Create Goods (with token):**
```bash
curl -X POST http://localhost:8080/goods/create \
  -H "Content-Type: application/json" \
  -H "token: YOUR_JWT_TOKEN" \
  -d '{"name":"二手教材","price":25.00,"description":"九成新数据结构教材","status":1}'
```

---

## Project Structure

```
twice hand system/
|-- pom.xml                              # Maven project configuration
|-- Dockerfile                           # Docker image definition
|-- docker-compose.yml                   # Multi-container orchestration
|-- README.md                            # This file
|-- TODO.md                              # Development roadmap and tasks
|-- INNOVATION_ROADMAP.md                # Innovation and patent proposals
|-- OPTIMIZATION_REPORT.md               # Project optimization report
|-- .gitignore                           # Git ignore rules
|-- .github/
|   +-- workflows/
|       +-- ci.yml                       # CI/CD pipeline
|-- docs/
|   |-- architecture.md                  # Architecture documentation
|   +-- API.md                           # API reference documentation
|-- src/
|   +-- main/
|   |   +-- java/com/campus/secondhand/
|   |       |-- SecondhandApplication.java    # Application entry point
|   |       |-- config/
|   |       |   |-- MyMetaObjectHandler.java  # Auto-fill audit fields
|   |       |   +-- WebConfig.java            # CORS and web configuration
|   |       |-- controller/
|   |       |   |-- UserController.java       # User registration and login
|   |       |   |-- GoodsController.java      # Goods CRUD operations
|   |       |   +-- OrderController.java      # Order management
|   |       |-- dto/
|   |       |   |-- LoginRequest.java         # Login request DTO
|   |       |   +-- RegisterRequest.java      # Registration request DTO
|   |       |-- entity/
|   |       |   |-- User.java                 # User entity
|   |       |   |-- Goods.java                # Goods entity
|   |       |   +-- Order.java                # Order entity
|   |       |-- exception/
|   |       |   |-- BusinessException.java    # Custom business exception
|   |       |   +-- GlobalExceptionHandler.java # Centralized error handling
|   |       |-- interceptor/
|   |       |   +-- JwtInterceptor.java       # JWT token validation interceptor
|   |       |-- mapper/
|   |       |   |-- UserMapper.java           # User data access
|   |       |   |-- GoodsMapper.java          # Goods data access
|   |       |   +-- OrderMapper.java          # Order data access
|   |       |-- response/
|   |       |   +-- Result.java               # Unified API response wrapper
|   |       |-- service/
|   |       |   |-- UserService.java          # User business logic interface
|   |       |   |-- GoodsService.java         # Goods business logic interface
|   |       |   |-- OrderService.java         # Order business logic interface
|   |       |   +-- impl/
|   |       |       |-- UserServiceImpl.java  # User service implementation
|   |       |       |-- GoodsServiceImpl.java # Goods service implementation
|   |       |       +-- OrderServiceImpl.java # Order service implementation
|   |       +-- util/
|   |           +-- JwtUtil.java              # JWT utility class
|   +-- resources/
|       |-- application.yml                   # Application configuration
|       |-- mapper/
|       |   |-- UserMapper.xml                # User SQL mappings
|       |   |-- GoodsMapper.xml               # Goods SQL mappings
|       |   +-- OrderMapper.xml               # Order SQL mappings
|       +-- sql/
|           +-- init.sql                      # Database initialization script
+-- src/test/
    +-- java/com/campus/secondhand/
        |-- service/
        |   |-- UserServiceTest.java          # User service tests
        |   |-- GoodsServiceTest.java         # Goods service tests
        |   +-- OrderServiceTest.java         # Order service tests
        |-- controller/
        |   |-- UserControllerTest.java       # User controller tests
        |   |-- GoodsControllerTest.java      # Goods controller tests
        |   +-- OrderControllerTest.java      # Order controller tests
        |-- util/
        |   +-- JwtUtilTest.java              # JWT utility tests
        +-- SecondhandApplicationTests.java   # Application context tests
```

---

## Testing

Run the full test suite:

```bash
# Run all tests
mvn test

# Run with coverage report
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=UserServiceTest
```

Test coverage targets:
- Service layer: 90%+
- Controller layer: 85%+
- Utility classes: 95%+

---

## Security

- **JWT Authentication** -- All protected endpoints require a valid JWT token in the `Authorization` header or `token` header.
- **Password Security** -- Passwords are hashed using MD5 before storage.
- **Interceptor Chain** -- `JwtInterceptor` validates tokens on every protected request.
- **Global Exception Handling** -- `GlobalExceptionHandler` ensures consistent error responses without leaking internal details.
- **CORS Configuration** -- Configurable cross-origin resource sharing policies.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow Google Java Style Guide
- Use Lombok annotations to reduce boilerplate
- Write unit tests for all new service methods
- Update API documentation for new endpoints

---

## Roadmap

- [x] User authentication with JWT
- [x] Goods CRUD operations
- [x] Order management
- [x] Docker containerization
- [x] CI/CD pipeline
- [x] Comprehensive test suite
- [ ] Add image upload for goods listings (MinIO integration)
- [ ] Implement search and filter functionality
- [ ] Add chat messaging between buyers and sellers
- [ ] Implement payment integration
- [ ] Add admin dashboard for platform management
- [ ] Add rating and review system
- [ ] WebSocket real-time notifications

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

For questions, issues, or feature requests, please open an issue in the repository.
