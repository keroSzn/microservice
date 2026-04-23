# Project Installation and Execution Guide

## Requirements
To run this microservices project, strictly ensure the following are installed on your machine:
- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Git**
- *Note: You do not need Java or Maven installed on your host machine, as the project uses Docker multi-stage builds.*

## Step 1: Download or Clone the Project
Open your terminal and navigate to the folder where you want to download the project.
If you have it as a zip file, simply extract it. If it's on Git:
```bash
git clone <repository_url>
cd microservice
```

## Step 2: Build and Run Services using Docker
The project includes a `docker-compose.yml` file which manages 3 distinct microservices (`user-service`, `inventory-service`, `order-aggregator`).

Run the following command from the root directory of the project (where docker-compose.yml is located):
```bash
docker-compose up -d --build
```
This command will:
1. Download a Maven + JDK image to compile the Java 21 Spring Boot apps in an isolated environment.
2. Build the final lightweight JRE images for all 3 microservices.
3. Start the containers and map them to ports:
   - `user-service`: http://localhost:8081
   - `inventory-service`: http://localhost:8082
   - `order-aggregator`: http://localhost:8080

*(The initial build might take a few minutes as it downloads maven dependencies).*

## Step 3: Verifying the Setup

Check if all containers are running:
```bash
docker-compose ps
```

You can view the logs of the order aggregator by running:
```bash
docker-compose logs -f order-aggregator
```

## Step 4: Testing the Endpoints (API)

Once the services are up and running, you can test if the Declarative Web Service Clients are working by calling the `order-aggregator` API.

**Test Endpoint:**
Open your browser or Postman and go to:
```
http://localhost:8080/orders/create/1/101
```

**Expected JSON Response:**
```json
{
  "status": "ORDER_CREATED_SUCCESSFULLY",
  "user": {
    "id": 1,
    "name": "Ali Yilmaz",
    "email": "ali@example.com",
    "balance": 1500.0
  },
  "product": {
    "id": 101,
    "name": "Laptop",
    "price": 1200.0,
    "stock": 10
  },
  "externalPost": {
    "id": 1,
    "userId": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur..."
  }
}
```
*Note that OpenFeign fetched the user, WebClient fetched the product, and Netflix Feign fetched the externalPost.*

## Stopping the Project
To stop the microservices, simply run:
```bash
docker-compose down
```
