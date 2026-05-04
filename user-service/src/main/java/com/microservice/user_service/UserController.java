package com.microservice.user_service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id).orElse(new User(id, "Unknown", "unknown@example.com", 0.0));
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/{id}/debit")
    public User debitBalance(@PathVariable Long id, @RequestParam Double amount) {
        if (amount == null || amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than 0");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getBalance() == null || user.getBalance() < amount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient balance");
        }

        user.setBalance(user.getBalance() - amount);
        return userRepository.save(user);
    }
}
