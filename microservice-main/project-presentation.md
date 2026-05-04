# Presentation: Declarative Web Service Clients

---

## Slide 1: Title
**Declarative Web Service Clients in Microservices**
*Comparing OpenFeign, WebClient, and Netflix Feign*
*Course: Microservices*

---

## Slide 2: The Problem
**Why do we need Declarative Clients?**
- Traditional HTTP clients (`RestTemplate`, `HttpClient`) require verbose boilerplate code.
- Managing URLs, headers, parsing JSON, and error handling manually is prone to errors.
- Microservices rely heavily on REST communication, demanding a cleaner, scalable solution.

---

## Slide 3: The Solution
**Declarative Clients**
- Define an interface and add annotations.
- The framework generates the HTTP client implementation dynamically at runtime.
- Reduces boilerplate, enforces the interface segregation principle, and integrates easily into the service layer.

---

## Slide 4: Project Architecture
**3 Microservices Running in Docker**
1. `user-service` (Port 8081) - Provides REST API for Mock Users.
2. `inventory-service` (Port 8082) - Provides REST API for Mock Products.
3. `order-aggregator` (Port 8080) - The **Client Hub**. Communicates with the other two services and external APIs to build an Order.

---

## Slide 5: Technology 1 - Spring Cloud OpenFeign
**Connecting to User Service**
- **History:** Originates from Netflix, adopted by Spring.
- **How it works:** Uses Spring MVC Annotations (`@GetMapping`).
- **Setup:** Only requires `@EnableFeignClients` and `@FeignClient` on the interface.
- **Pros:** Industry standard, highly integrated with Spring Cloud (Eureka, LoadBalancer).
- **Cons:** Tricky to configure for pure reactive/non-blocking applications.

---

## Slide 6: Technology 2 - Spring WebClient (HTTP Interfaces)
**Connecting to Inventory Service**
- **History:** Introduced in Spring Framework 6.
- **How it works:** Utilizes `@GetExchange` and proxies through a reactive `WebClient`.
- **Setup:** Requires defining an interface and a Bean using `HttpServiceProxyFactory`.
- **Pros:** Native to Spring 6, built for modern reactive/asynchronous systems.
- **Cons:** Relatively new, requires slight configuration for the proxy factory.

---

## Slide 7: Technology 3 - Netflix Feign Core
**Connecting to External APIs**
- **History:** The original project. Pure Java library.
- **How it works:** Uses its own annotations (`@RequestLine`, `@Param`).
- **Setup:** Instantiated via `Feign.builder().target(...)`.
- **Pros:** Framework agnostic. Can be used in plain Java apps without Spring.
- **Cons:** No auto-configuration, manual setup of decoders/encoders.

---

## Slide 8: Live Demo & Docker
**Demonstrating the Setup**
1. Show `docker-compose up -d --build`.
2. Hit the Endpoint: `http://localhost:8080/orders/create/1/101`.
3. Explain the JSON payload aggregating results from OpenFeign, WebClient, and Netflix Feign simultaneously.

---

## Slide 9: Conclusion and Q&A
- Different tools for different eras and use cases.
- **OpenFeign** = The proven monolithic/synchronous legacy.
- **WebClient Interfaces** = The modern reactive standard.
- **Netflix Feign Core** = The lightweight framework-independent approach.
- *Questions?*
