package com.microservice.order_aggregator.controller;

import com.microservice.order_aggregator.client.InventoryClient;
import com.microservice.order_aggregator.client.PostClient;
import com.microservice.order_aggregator.client.UserClient;
import com.microservice.order_aggregator.dto.OrderResponse;
import com.microservice.order_aggregator.dto.PostDTO;
import com.microservice.order_aggregator.dto.ProductDTO;
import com.microservice.order_aggregator.dto.UserDTO;
import com.microservice.order_aggregator.entity.OrderEntity;
import com.microservice.order_aggregator.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final UserClient userClient;
    private final InventoryClient inventoryClient;
    private final PostClient postClient;
    private final OrderRepository orderRepository;

    @GetMapping("/create/{userId}/{productId}")
    public OrderResponse createOrder(@PathVariable Long userId, @PathVariable Long productId) {

        UserDTO user = userClient.getUser(userId);
        ProductDTO product = inventoryClient.getProduct(productId);
        PostDTO post = postClient.getPostById(1L);

        String status = "ORDER_FAILED";
        if (user != null && user.id() != null && product != null && product.id() != null) {
            status = "ORDER_CREATED_SUCCESSFULLY";
            
            OrderEntity orderEntity = new OrderEntity();
            orderEntity.setUserId(userId);
            orderEntity.setProductId(productId);
            orderEntity.setStatus(status);
            orderEntity.setOrderDate(LocalDateTime.now());
            orderRepository.save(orderEntity);
        }

        return new OrderResponse(status, user, product, post);
    }

    @GetMapping("/history")
    public List<OrderEntity> getOrderHistory() {
        return orderRepository.findAll();
    }

    // Proxy endpoints for Admin UI
    @GetMapping("/proxy/users")
    public List<UserDTO> getAllUsers() {
        return userClient.getAllUsers();
    }

    @PostMapping("/proxy/users")
    public UserDTO createUser(@RequestBody UserDTO user) {
        return userClient.createUser(user);
    }

    @GetMapping("/proxy/products")
    public List<ProductDTO> getAllProducts() {
        return inventoryClient.getAllProducts();
    }

    @PostMapping("/proxy/products")
    public ProductDTO createProduct(@RequestBody ProductDTO product) {
        return inventoryClient.createProduct(product);
    }
}
