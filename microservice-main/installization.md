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
The project includes a `docker-compose.yml` file which manages 4 distinct containers (a PostgreSQL Database and 3 microservices: `user-service`, `inventory-service`, `order-aggregator`).

Run the following command from the root directory of the project (where docker-compose.yml is located):
```bash
docker-compose up -d --build
```
This command will:
1. Download a Maven + JDK image to compile the Java 21 Spring Boot apps in an isolated environment.
2. Build the final lightweight JRE images for all 3 microservices.
3. Start the containers and map them to ports:
   - `postgres-db`: 5432 (Internal Database)
   - `user-service`: http://localhost:8081
   - `inventory-service`: http://localhost:8082
   - `order-aggregator` (Admin Panel UI): http://localhost:8080

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

## Step 4: Testing the Setup (Admin Dashboard)

Instead of manually calling endpoints via Postman, this project features a built-in **Admin Dashboard UI** to easily interact with the Database via the declarative clients.

1. Open your browser and go to:
```
http://localhost:8080/admin.html
```

2. **Add Users & Products:**
Navigate to the "Users" and "Inventory" tabs to create real database entries. The proxy forwards these requests to the internal microservices using OpenFeign and WebClient.

3. **Create an Order:**
Go to the "Orders" tab. Select the User and Product you just created from the dropdown menus. When you click "Process Order", the system will fetch the data via our 3 Declarative Clients and save the result into the PostgreSQL Database.

## Stopping the Project
To stop the microservices, simply run:
```bash
docker-compose down
```
