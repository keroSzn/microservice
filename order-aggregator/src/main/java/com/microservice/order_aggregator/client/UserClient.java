package com.microservice.order_aggregator.client;

import com.microservice.order_aggregator.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

// Connects to user-service
@FeignClient(name = "user-service", url = "${user-service.url}")
public interface UserClient {

    @GetMapping("/users")
    List<UserDTO> getAllUsers();

    @GetMapping("/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);

    @PostMapping("/users")
    UserDTO createUser(@RequestBody UserDTO user);

    @PostMapping("/users/{id}/debit")
    UserDTO debitBalance(@PathVariable("id") Long id, @RequestParam("amount") Double amount);
}
