package com.microservice.order_aggregator.client;

import com.microservice.order_aggregator.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Connects to user-service
@FeignClient(name = "user-service", url = "${user-service.url}")
public interface UserClient {

    @GetMapping("/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}
