package com.microservice.order_aggregator.client;

import com.microservice.order_aggregator.dto.ProductDTO;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.PostExchange;

import java.util.List;

// Connects to inventory-service using Spring 6 Declarative HTTP interface
public interface InventoryClient {

    @GetExchange("/products")
    List<ProductDTO> getAllProducts();

    @GetExchange("/products/{id}")
    ProductDTO getProduct(@PathVariable("id") Long id);

    @PostExchange("/products")
    ProductDTO createProduct(@RequestBody ProductDTO product);

    @PostExchange("/products/{id}/consume")
    ProductDTO consumeStock(@PathVariable("id") Long id, @RequestParam("amount") Integer amount);
}
