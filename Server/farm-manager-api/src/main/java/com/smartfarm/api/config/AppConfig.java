package com.smartfarm.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configuration cho các beans cần thiết
 */
@Configuration
public class AppConfig {

    /**
     * RestClient bean để gọi external APIs (Python AI service)
     * Spring Boot 3+ sử dụng RestClient thay thế RestTemplate
     */
    @Bean
    public RestClient restClient() {
        return RestClient.builder().build();
    }

    /**
     * ObjectMapper bean để parse JSON
     * Dùng cho việc parse response từ Python AI service
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
