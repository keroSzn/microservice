package com.microservice.order_aggregator.client;

import com.microservice.order_aggregator.dto.PostDTO;
import feign.Param;
import feign.RequestLine;

// Pure Netflix Feign interface (No Spring annotations)
// Connects to a public mock API
public interface PostClient {

    @RequestLine("GET /posts/{id}")
    PostDTO getPostById(@Param("id") Long id);
}
