package com.smartfarm.api.scheduler;

import com.smartfarm.api.service.WeatherCheckService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job tự động kiểm tra thời tiết mỗi 1 tiếng.
 * Lấy danh sách toạ độ hợp lệ → gọi Open-Meteo → lưu cảnh báo và gửi Email/WebSocket.
 */
@Component
public class WeatherScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeatherScheduler.class);

    private final WeatherCheckService weatherCheckService;

    @Autowired
    public WeatherScheduler(WeatherCheckService weatherCheckService) {
        this.weatherCheckService = weatherCheckService;
    }

    /**
     * Chạy lúc khởi động (delay 10s) và sau đó mỗi 1 tiếng.
     * fixedDelay = 60 * 60 * 1000 ms = 3_600_000 ms
     * initialDelay = 10_000 ms (10 giây sau khi app start xong)
     */
    @Scheduled(initialDelay = 10_000, fixedDelay = 3_600_000)
    public void checkWeatherForAllBatches() {
        log.info("[WeatherScheduler] ⏰ Bắt đầu kiểm tra thời tiết định kỳ cho tất cả tọa độ (mỗi 1 tiếng)...");

        try {
            weatherCheckService.checkAllLocationsAndGenerateAlerts();
            log.info("[WeatherScheduler] ✅ Hoàn tất việc kiểm tra thời tiết và gửi cảnh báo.");
        } catch (Exception e) {
            log.error("[WeatherScheduler] ❌ Lỗi khi kiểm tra thời tiết định kỳ: {}", e.getMessage());
        }
    }
}
