package com.microservice.order_aggregator.client;

import com.microservice.order_aggregator.dto.ProductDTO;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;

// Connects to inventory-service using Spring 6 Declarative HTTP interface
public interface InventoryClient {

    @GetExchange("/products/{id}")
    ProductDTO getProduct(@PathVariable("id") Long id);
}
