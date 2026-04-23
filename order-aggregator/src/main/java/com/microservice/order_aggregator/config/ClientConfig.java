package com.microservice.order_aggregator.config;

import com.microservice.order_aggregator.client.InventoryClient;
import com.microservice.order_aggregator.client.PostClient;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.support.WebClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class ClientConfig {

    @Value("${inventory-service.url}")
    private String inventoryServiceUrl;

    @Value("${post-service.url}")
    private String postServiceUrl;

    // 1. Spring Declarative HTTP Interface using WebClient
    @Bean
    public InventoryClient inventoryClient() {
        WebClient webClient = WebClient.builder()
                .baseUrl(inventoryServiceUrl)
                .build();
        
        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(WebClientAdapter.create(webClient))
                .build();
                
        return factory.createClient(InventoryClient.class);
    }

    // 2. Pure Netflix Feign (Core) initialization
    @Bean
    public PostClient postClient() {
        return Feign.builder()
                .encoder(new JacksonEncoder())
                .decoder(new JacksonDecoder())
                .target(PostClient.class, postServiceUrl);
    }
}
