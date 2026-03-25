package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.WeatherAlertDto;
import com.smartfarm.api.dto.WeatherCurrentDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.repository.PlantingBatchRepository;
import com.smartfarm.api.service.WeatherAlertService;
import com.smartfarm.api.service.WeatherCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather-alerts")
@CrossOrigin(origins = "*")
public class WeatherAlertController {

    private final WeatherAlertService weatherAlertService;
    private final WeatherCheckService weatherCheckService;
    private final PlantingBatchRepository plantingBatchRepository;

    @Autowired
    public WeatherAlertController(WeatherAlertService weatherAlertService,
            WeatherCheckService weatherCheckService,
            PlantingBatchRepository plantingBatchRepository) {
        this.weatherAlertService = weatherAlertService;
        this.weatherCheckService = weatherCheckService;
        this.plantingBatchRepository = plantingBatchRepository;
    }

    // =========================================================================
    // Các API CRUD cơ bản
    // =========================================================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeatherAlertDto>>> getAll(
            @RequestParam(required = false) Integer pBatchId) {
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
    public ResponseEntity<ApiResponse<WeatherAlertDto>> getById(@PathVariable Integer id) {
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
    public ResponseEntity<ApiResponse<WeatherAlertDto>> update(@PathVariable Integer id,
            @RequestBody WeatherAlertDto dto) {
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
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
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

    // =========================================================================
    // API tích hợp dự báo thời tiết
    // =========================================================================

    /**
     * Kiểm tra thời tiết hiện tại cho một PlantingBatch (theo locationCoords),
     * phân tích điều kiện và LƯU cảnh báo vào database.
     * <p>
     * Endpoint: POST /api/weather-alerts/check/{pBatchId}
     * <p>
     * Ví dụ: POST /api/weather-alerts/check/1
     * Trả về danh sách cảnh báo vừa được tạo (có thể rỗng nếu thời tiết tốt).
     */
    @PostMapping("/check/{pBatchId}")
    public ResponseEntity<ApiResponse<List<WeatherAlertDto>>> checkAndGenerateAlerts(
            @PathVariable Integer pBatchId) {
        try {
            List<WeatherAlertDto> alerts = weatherCheckService.checkAndGenerateAlerts(pBatchId);
            if (alerts.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success(alerts,
                        "✅ Thời tiết hiện tại tốt - Không có cảnh báo nào được sinh ra."));
            }
            return ResponseEntity.ok(ApiResponse.success(alerts,
                    String.format("⚠️ Đã phát hiện %d cảnh báo thời tiết và lưu vào hệ thống.", alerts.size())));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Lỗi khi kiểm tra thời tiết: " + e.getMessage()));
        }
    }

    /**
     * Xem thông tin thời tiết hiện tại (KHÔNG lưu cảnh báo).
     * Dùng để hiển thị widget thời tiết trên dashboard.
     * <p>
     * Endpoint: GET /api/weather-alerts/weather/{pBatchId}
     */
    @GetMapping("/weather/{pBatchId}")
    public ResponseEntity<ApiResponse<WeatherCurrentDto>> getCurrentWeather(
            @PathVariable Integer pBatchId) {
        try {
            WeatherCurrentDto data = weatherCheckService.getWeatherInfo(pBatchId);
            if (data == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(ApiResponse.error(503, "Không thể lấy dữ liệu thời tiết lúc này."));
            }
            return ResponseEntity.ok(ApiResponse.success(data, "Dữ liệu thời tiết hiện tại"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * Dashboard endpoint: lấy thông tin thời tiết hiện tại + cảnh báo mới nhất
     * dựa vào PlantingBatch mới nhất có locationCoords.
     * <p>
     * Endpoint: GET /api/weather-alerts/latest-weather
     * Response: { weather: WeatherCurrentDto, alerts: List<WeatherAlertDto>,
     * batchName, batchId }
     */
    @GetMapping("/latest-weather")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLatestWeatherForDashboard() {
        try {
            PlantingBatch latestBatch = plantingBatchRepository
                    .findLatestWithCoords()
                    .orElse(null);

            if (latestBatch == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404,
                                "Chưa có lô trồng nào có tọa độ. Vui lòng cập nhật locationCoords."));
            }

            // Lấy thời tiết hiện tại
            WeatherCurrentDto weather = weatherCheckService.getWeatherInfo(latestBatch.getPBatchId());

            // Lấy 5 cảnh báo mới nhất của batch này từ DB
            List<WeatherAlertDto> recentAlerts = weatherAlertService
                    .findByBatchId(latestBatch.getPBatchId())
                    .stream()
                    .sorted((a, b) -> {
                        if (a.getCreatedAt() == null || b.getCreatedAt() == null)
                            return 0;
                        return b.getCreatedAt().compareTo(a.getCreatedAt());
                    })
                    .limit(5)
                    .toList();

            Map<String, Object> result = new HashMap<>();
            result.put("batchId", latestBatch.getPBatchId());
            result.put("batchName", latestBatch.getBatchName());
            result.put("locationCoords", latestBatch.getLocationCoords());
            result.put("weather", weather);
            result.put("recentAlerts", recentAlerts);

            return ResponseEntity.ok(ApiResponse.success(result, "Dashboard weather data"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Lỗi khi lấy dữ liệu dashboard: " + e.getMessage()));
        }
    }

    /**
     * Dashboard endpoint: lấy thông tin thời tiết hiện tại + cảnh báo mới nhất
     * TRỰC TIẾP cho một lô trồng cụ thể (pBatchId).
     * <p>
     * Endpoint: GET /api/weather-alerts/dashboard/{pBatchId}
     * Response: { weather: WeatherCurrentDto, alerts: List<WeatherAlertDto>,
     * batchName, batchId }
     */
    @GetMapping("/{pBatchId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardWeatherByBatchId(
            @PathVariable Integer pBatchId) {
        try {
            PlantingBatch batch = plantingBatchRepository.findById(pBatchId).orElse(null);

            if (batch == null || batch.getLocationCoords() == null || batch.getLocationCoords().isBlank()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404,
                                "Không tìm thấy lô trồng hoặc lô trồng chưa có tọa độ (locationCoords)."));
            }

            // Lấy thời tiết hiện tại
            WeatherCurrentDto weather = weatherCheckService.getWeatherInfo(batch.getPBatchId());

            Map<String, Object> result = new HashMap<>();
            result.put("batchId", batch.getPBatchId());
            result.put("batchName", batch.getBatchName());
            result.put("locationCoords", batch.getLocationCoords());
            result.put("weather", weather);

            return ResponseEntity.ok(ApiResponse.success(result, "Dashboard weather data for batch " + pBatchId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Lỗi khi lấy dữ liệu thời tiết: " + e.getMessage()));
        }
    }
}
