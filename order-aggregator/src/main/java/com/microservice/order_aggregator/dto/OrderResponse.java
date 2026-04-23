package com.microservice.order_aggregator.dto;

public record OrderResponse(String status, UserDTO user, ProductDTO product, PostDTO externalPost) {}
