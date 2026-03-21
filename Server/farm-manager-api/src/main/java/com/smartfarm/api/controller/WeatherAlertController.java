package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.WeatherAlertDto;
import com.smartfarm.api.service.WeatherAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather-alerts")
@CrossOrigin(origins = "*")
public class WeatherAlertController {

    private final WeatherAlertService weatherAlertService;

    @Autowired
    public WeatherAlertController(WeatherAlertService weatherAlertService) {
        this.weatherAlertService = weatherAlertService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeatherAlertDto>>> getAll(
            @RequestParam(required = false) Long pBatchId) {
        try {
            List<WeatherAlertDto> data = (pBatchId != null)
                    ? weatherAlertService.findByBatchId(pBatchId)
                    : weatherAlertService.findAll();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WeatherAlertDto>> getById(@PathVariable Long id) {
        return weatherAlertService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("WeatherAlert not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WeatherAlertDto>> create(@RequestBody WeatherAlertDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(weatherAlertService.create(dto), "WeatherAlert created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WeatherAlertDto>> update(@PathVariable Long id, @RequestBody WeatherAlertDto dto) {
        try {
            return weatherAlertService.update(id, dto)
                    .map(data -> ResponseEntity.ok(ApiResponse.success(data, "WeatherAlert updated successfully")))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.notFound("WeatherAlert not found with id: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            if (weatherAlertService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "WeatherAlert deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("WeatherAlert not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
