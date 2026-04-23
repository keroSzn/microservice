package com.microservice.order_aggregator.dto;

public record ProductDTO(Long id, String name, Double price, Integer stock) {}
