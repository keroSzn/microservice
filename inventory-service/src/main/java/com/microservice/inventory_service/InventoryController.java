package com.microservice.inventory_service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class InventoryController {

    private final Map<Long, Product> products;

    public InventoryController() {
        products = new HashMap<>();
        products.put(101L, new Product(101L, "Laptop", 1200.0, 10));
        products.put(102L, new Product(102L, "Smartphone", 800.0, 50));
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return products.getOrDefault(id, new Product(id, "Unknown Product", 0.0, 0));
    }
}
