package com.microservice.user_service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final Map<Long, User> users;

    public UserController() {
        users = new HashMap<>();
        users.put(1L, new User(1L, "Ali Yilmaz", "ali@example.com", 1500.0));
        users.put(2L, new User(2L, "Ayse Demir", "ayse@example.com", 3000.0));
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return users.getOrDefault(id, new User(id, "Unknown", "unknown@example.com", 0.0));
    }
}
