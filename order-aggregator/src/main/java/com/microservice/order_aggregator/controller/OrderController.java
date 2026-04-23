package com.microservice.order_aggregator.controller;

import com.microservice.order_aggregator.client.InventoryClient;
import com.microservice.order_aggregator.client.PostClient;
import com.microservice.order_aggregator.client.UserClient;
import com.microservice.order_aggregator.dto.OrderResponse;
import com.microservice.order_aggregator.dto.PostDTO;
import com.microservice.order_aggregator.dto.ProductDTO;
import com.microservice.order_aggregator.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final UserClient userClient;
    private final InventoryClient inventoryClient;
    private final PostClient postClient;

    @GetMapping("/create/{userId}/{productId}")
    public OrderResponse createOrder(@PathVariable Long userId, @PathVariable Long productId) {

        // 1. Fetch from User Service using OpenFeign
        UserDTO user = userClient.getUser(userId);

        // 2. Fetch from Inventory Service using WebClient (HTTP Interface)
        ProductDTO product = inventoryClient.getProduct(productId);

        // 3. Fetch from External fake API using Netflix Feign (Core)
        // This is just to demonstrate its usage.
        PostDTO post = postClient.getPostById(1L);

        // Put them together into a response
        if (user.id() != null && product.id() != null) {
            return new OrderResponse("ORDER_CREATED_SUCCESSFULLY", user, product, post);
        } else {
            return new OrderResponse("ORDER_FAILED", user, product, post);
        }
    }
}
