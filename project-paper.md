# A Comparative Study of Declarative Web Service Clients in Microservices

## 1. Abstract
In modern distributed systems and microservice architectures, efficient and clean communication between services is paramount. This project explores, implements, and compares three dominant declarative web service clients in the Java Spring Boot ecosystem: Spring Cloud OpenFeign, Spring WebClient (with declarative HTTP Interfaces), and pure Netflix Feign. An e-commerce domain-driven architecture utilizing a User Service, an Inventory Service, and an Order Aggregator Service has been deployed in a Docker environment to practically demonstrate the nuances, configurations, and use cases for each client.

## 2. Introduction
As monolithic architectures break down into microservices, the complexity of the system shifts from internal logic towards inter-service communication. Writing low-level HTTP clients using `RestTemplate` or `HttpURLConnection` introduces boilerplate code, increases maintenance overhead, and violates the "Don't Repeat Yourself" (DRY) principle. Declarative REST clients solve this by mapping HTTP endpoints to Java interfaces. The developer simply defines the method signature and annotates it, and the framework dynamically generates the implementation at runtime. This paper focuses on the three specific declarative clients and their integration within a multi-container Dockerized application.

## 3. Background

### 3.1 Spring Cloud OpenFeign
OpenFeign was originally developed by Netflix and later adopted by Spring Cloud. It acts as an abstraction over HTTP clients. It is highly integrated with the Spring ecosystem (Eureka for Service Discovery, Resilience4j for circuit breaking) and utilizes standard Spring MVC annotations (e.g., `@GetMapping`). It operates synchronously by default.

### 3.2 Spring WebClient and HTTP Interfaces
Introduced in Spring 6 and Spring Boot 3, HTTP Interfaces offer a native, declarative way to define HTTP services without relying on OpenFeign. Under the hood, it leverages `WebClient` (or `RestClient` in synchronous setups) and thus strongly supports reactive, non-blocking asynchronous programming paradigms. It uses distinct annotations like `@GetExchange`.

### 3.3 Netflix Feign (Core)
Before Spring's extensive wrapping and auto-configuration, Netflix Feign existed as a standalone library. It does not rely on Spring contexts or beans natively and requires manual programmatic configuration (Builder pattern) and uses its own annotations (e.g., `@RequestLine`). Exploring this helps understand the raw mechanics behind OpenFeign.

## 4. Development Details

### 4.1 Architecture
The system consists of three independent microservices running on Java 21 and Spring Boot 3:
1. **User Service (Port 8081)**: Manages customer information.
2. **Inventory Service (Port 8082)**: Manages product stock.
3. **Order Aggregator (Port 8080)**: Acts as the orchestration layer combining the clients.

### 4.2 Implementation of Clients in Order Aggregator

**A. OpenFeign implementation (`UserClient`)**
The `UserClient` interface connects to the User Service. 
```java
@FeignClient(name = "user-service", url = "${user-service.url}")
public interface UserClient {
    @GetMapping("/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}
```
This requires only the `@EnableFeignClients` annotation on the main class.

**B. WebClient HTTP Interface implementation (`InventoryClient`)**
The `InventoryClient` interface connects to the Inventory Service using Spring 6's `@GetExchange`.
```java
public interface InventoryClient {
    @GetExchange("/products/{id}")
    ProductDTO getProduct(@PathVariable("id") Long id);
}
```
A bean is required to proxy this interface with `WebClient`.
```java
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(WebClientAdapter.create(webClient)).build();
return factory.createClient(InventoryClient.class);
```

**C. Netflix Feign Core implementation (`PostClient`)**
This connects to an external mock API.
```java
public interface PostClient {
    @RequestLine("GET /posts/{id}")
    PostDTO getPostById(@Param("id") Long id);
}
```
Built programmatically:
```java
return Feign.builder()
            .encoder(new JacksonEncoder())
            .decoder(new JacksonDecoder())
            .target(PostClient.class, url);
```

### 4.3 Containerization
Every service contains a multi-stage `Dockerfile`. The stage `maven:3.9.6-eclipse-temurin-21-alpine` is used for compiling the Java code, and `eclipse-temurin:21-jre-alpine` acts as the lean runtime image. `docker-compose.yml` bridges the internal networking domains so URLs such as `http://user-service:8081` resolve perfectly during communication. 

## 5. Conclusion
Declarative clients drastically reduce the cognitive load involved in network communication between microservices. While OpenFeign remains the industry standard for synchronous Spring applications due to its mature ecosystem, Spring 6 HTTP Interfaces (powered by WebClient) represent the modern, native, and reactive future of inter-service calls. Understanding pure Netflix Feign provides vital historical and mechanistic context to how these proxy frameworks operate underneath.
