package com.microservice.order_aggregator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class OrderAggregatorApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderAggregatorApplication.class, args);
	}

}
