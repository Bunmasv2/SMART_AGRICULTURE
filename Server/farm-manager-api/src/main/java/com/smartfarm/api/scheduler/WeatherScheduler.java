package com.smartfarm.api.scheduler;

import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.repository.PlantingBatchRepository;
import com.smartfarm.api.service.WeatherCheckService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job tự động kiểm tra thời tiết mỗi 30 phút.
 * Lấy PlantingBatch mới nhất có toạ độ → gọi Open-Meteo → lưu cảnh báo.
 */
@Component
public class WeatherScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeatherScheduler.class);

    private final PlantingBatchRepository plantingBatchRepository;
    private final WeatherCheckService weatherCheckService;

    @Autowired
    public WeatherScheduler(PlantingBatchRepository plantingBatchRepository,
            WeatherCheckService weatherCheckService) {
        this.plantingBatchRepository = plantingBatchRepository;
        this.weatherCheckService = weatherCheckService;
    }

    /**
     * Chạy lúc khởi động (delay 10s) và sau đó mỗi 30 phút.
     * fixedDelay = 30 * 60 * 1000 ms = 1_800_000 ms
     * initialDelay = 10_000 ms (10 giây sau khi app start xong)
     */
    @Scheduled(initialDelay = 10_000, fixedDelay = 1_800_000)
    public void checkWeatherForLatestBatch() {
        log.info("[WeatherScheduler] ⏰ Bắt đầu kiểm tra thời tiết định kỳ...");

        PlantingBatch batch = plantingBatchRepository
                .findLatestWithCoords()
                .orElse(null);

        if (batch == null) {
            log.warn("[WeatherScheduler] Không tìm thấy PlantingBatch nào có locationCoords. Bỏ qua.");
            return;
        }

        log.info("[WeatherScheduler] Đang kiểm tra thời tiết cho batch '{}' (id={}, coords={})",
                batch.getBatchName(), batch.getPBatchId(), batch.getLocationCoords());

        try {
            var alerts = weatherCheckService.checkAndGenerateAlerts(batch.getPBatchId());
            if (alerts.isEmpty()) {
                log.info("[WeatherScheduler] ✅ Thời tiết tốt - Không có cảnh báo.");
            } else {
                log.warn("[WeatherScheduler] ⚠️ Đã tạo {} cảnh báo thời tiết.", alerts.size());
                alerts.forEach(a -> log.warn("  → [{}] {}", a.getAlertType(), a.getDescription()));
            }
        } catch (Exception e) {
            log.error("[WeatherScheduler] ❌ Lỗi khi kiểm tra thời tiết: {}", e.getMessage());
        }
    }
}
