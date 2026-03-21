package com.smartfarm.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ❌ Disable CSRF (API only)
                .csrf(AbstractHttpConfigurer::disable)

                // ✅ Enable CORS với config custom
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ Cho phép toàn bộ request (dev mode)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())

                // ✅ Stateless (không dùng session)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ CHỈ cho phép frontend Vite (port 5173)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // ✅ Cho phép tất cả method cần thiết
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // ✅ Cho phép tất cả headers
        configuration.setAllowedHeaders(List.of("*"));

        // ✅ Cho phép gửi cookie / auth (axios withCredentials)
        configuration.setAllowCredentials(true);

        // (Optional) expose headers nếu cần
        configuration.setExposedHeaders(List.of("*"));

        // Cache preflight request
        configuration.setMaxAge(3600L);

        // Apply config cho toàn bộ API
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}