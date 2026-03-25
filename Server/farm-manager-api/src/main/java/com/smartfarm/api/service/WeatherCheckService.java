package com.smartfarm.api.service;

import com.smartfarm.api.dto.WeatherAlertDto;
import com.smartfarm.api.dto.WeatherCurrentDto;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.entity.WeatherAlert;
import com.smartfarm.api.mapper.WeatherAlertMapper;
import com.smartfarm.api.repository.PlantingBatchRepository;
import com.smartfarm.api.repository.WeatherAlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service kiểm tra điều kiện thời tiết và sinh cảnh báo tự động.
 * Mỗi lần gọi sẽ:
 * 1. Lấy dữ liệu thời tiết hiện tại từ Open-Meteo
 * 2. Phân tích theo các ngưỡng cảnh báo
 * 3. Lưu cảnh báo vào DB và trả về danh sách cảnh báo
 */
@Service
@Transactional
public class WeatherCheckService {

    private static final Logger log = LoggerFactory.getLogger(WeatherCheckService.class);

    // ===== Ngưỡng cảnh báo =====
    private static final int RAIN_PROBABILITY_THRESHOLD = 70; // %
    private static final double HIGH_TEMP_THRESHOLD = 35.0; // °C
    private static final double LOW_TEMP_THRESHOLD = 15.0; // °C
    private static final double STRONG_WIND_THRESHOLD = 40.0; // km/h
    private static final int HIGH_HUMIDITY_THRESHOLD = 90; // %
    private static final int STORM_WEATHER_CODE = 95; // WMO code

    private final PlantingBatchRepository plantingBatchRepository;
    private final WeatherAlertRepository weatherAlertRepository;
    private final WeatherAlertMapper weatherAlertMapper;
    private final OpenMeteoService openMeteoService;

    @Autowired
    public WeatherCheckService(PlantingBatchRepository plantingBatchRepository,
            WeatherAlertRepository weatherAlertRepository,
            WeatherAlertMapper weatherAlertMapper,
            OpenMeteoService openMeteoService) {
        this.plantingBatchRepository = plantingBatchRepository;
        this.weatherAlertRepository = weatherAlertRepository;
        this.weatherAlertMapper = weatherAlertMapper;
        this.openMeteoService = openMeteoService;
    }

    /**
     * Kiểm tra thời tiết cho một PlantingBatch và lưu cảnh báo vào DB.
     *
     * @param pBatchId ID của PlantingBatch
     * @return danh sách WeatherAlertDto vừa được tạo
     */
    public List<WeatherAlertDto> checkAndGenerateAlerts(Integer pBatchId) {
        PlantingBatch batch = plantingBatchRepository.findById(pBatchId)
                .orElseThrow(() -> new RuntimeException("PlantingBatch not found with id: " + pBatchId));

        String locationCoords = batch.getLocationCoords();
        if (locationCoords == null || locationCoords.isBlank()) {
            throw new RuntimeException(
                    "PlantingBatch '" + batch.getBatchName() + "' chưa có tọa độ (locationCoords). " +
                            "Vui lòng cập nhật trước khi kiểm tra thời tiết.");
        }

        // Lấy dữ liệu thời tiết từ Open-Meteo
        WeatherCurrentDto weatherData = openMeteoService.getCurrentWeather(locationCoords);
        if (weatherData == null || weatherData.getCurrent() == null) {
            throw new RuntimeException(
                    "Không thể lấy dữ liệu thời tiết cho tọa độ: " + locationCoords);
        }

        WeatherCurrentDto.Current w = weatherData.getCurrent();
        List<WeatherAlert> generatedAlerts = new ArrayList<>();

        log.info(
                "Checking weather alerts for batch '{}' (coords: {}): temp={}, rain={}%, wind={} km/h, humidity={}%, code={}",
                batch.getBatchName(), locationCoords,
                w.getTemperature(), w.getPrecipitationProbability(),
                w.getWindSpeed(), w.getRelativeHumidity(), w.getWeatherCode());

        // ── 1. Cảnh báo giông bão (weathercode >= 95) ──────────────────────
        if (w.getWeatherCode() != null && w.getWeatherCode() >= STORM_WEATHER_CODE) {
            String desc = String.format(
                    "⛈️ CẢNH BÁO GIÔNG BÃO - Mã thời tiết: %d. " +
                            "Hãy đảm bảo an toàn cho cây trồng và thiết bị nông nghiệp, " +
                            "thu hoạch sản phẩm đến kỳ ngay lập tức.",
                    w.getWeatherCode());
            generatedAlerts.add(buildAlert(batch, "STORM", desc));
        }

        // ── 2. Cảnh báo nguy cơ mưa to ────────────────────────────────────
        if (w.getPrecipitationProbability() != null
                && w.getPrecipitationProbability() >= RAIN_PROBABILITY_THRESHOLD) {
            String desc = String.format(
                    "🌧️ NGUY CƠ MƯA LỚN - Xác suất mưa hiện tại: %d%%. " +
                            "Vui lòng che phủ vật tư phân bón, hạt giống và thu hoạch sớm nếu cần thiết. " +
                            "Kiểm tra hệ thống thoát nước trên ruộng.",
                    w.getPrecipitationProbability());
            generatedAlerts.add(buildAlert(batch, "RAIN_RISK", desc));
        }

        // ── 3. Cảnh báo nhiệt độ cao ───────────────────────────────────────
        if (w.getTemperature() != null && w.getTemperature() >= HIGH_TEMP_THRESHOLD) {
            String desc = String.format(
                    "🌡️ NHIỆT ĐỘ CAO - Nhiệt độ hiện tại: %.1f°C (ngưỡng cảnh báo: %.0f°C). " +
                            "Hãy tưới nước cho cây ngay lập tức, tốt nhất vào buổi sáng sớm hoặc chiều tối. " +
                            "Sử dụng lưới che nắng để giảm tác động nhiệt.",
                    w.getTemperature(), HIGH_TEMP_THRESHOLD);
            generatedAlerts.add(buildAlert(batch, "HIGH_TEMP", desc));
        }

        // ── 4. Cảnh báo nhiệt độ thấp ─────────────────────────────────────
        if (w.getTemperature() != null && w.getTemperature() <= LOW_TEMP_THRESHOLD) {
            String desc = String.format(
                    "❄️ NHIỆT ĐỘ THẤP - Nhiệt độ hiện tại: %.1f°C (ngưỡng cảnh báo: %.0f°C). " +
                            "Che phủ cây trồng bằng nilon hoặc vải không dệt để tránh sương giá. " +
                            "Hạn chế tưới nước trong điều kiện nhiệt độ thấp.",
                    w.getTemperature(), LOW_TEMP_THRESHOLD);
            generatedAlerts.add(buildAlert(batch, "LOW_TEMP", desc));
        }

        // ── 5. Cảnh báo gió mạnh ──────────────────────────────────────────
        if (w.getWindSpeed() != null && w.getWindSpeed() >= STRONG_WIND_THRESHOLD) {
            String desc = String.format(
                    "💨 GIÓ MẠNH - Tốc độ gió hiện tại: %.1f km/h (ngưỡng cảnh báo: %.0f km/h). " +
                            "Kiểm tra và cố định giàn, cọc chống cho cây. " +
                            "Tạm hoãn phun thuốc và bón phân để tránh bay hơi không cần thiết.",
                    w.getWindSpeed(), STRONG_WIND_THRESHOLD);
            generatedAlerts.add(buildAlert(batch, "STRONG_WIND", desc));
        }

        // ── 6. Cảnh báo độ ẩm cao ─────────────────────────────────────────
        if (w.getRelativeHumidity() != null && w.getRelativeHumidity() >= HIGH_HUMIDITY_THRESHOLD) {
            String desc = String.format(
                    "💧 ĐỘ ẨM RẤT CAO - Độ ẩm hiện tại: %d%% (ngưỡng cảnh báo: %d%%). " +
                            "Nguy cơ cao phát sinh nấm bệnh và sâu bệnh hại. " +
                            "Kiểm tra cây thường xuyên, thông gió tốt và cân nhắc phòng ngừa bệnh kịp thời.",
                    w.getRelativeHumidity(), HIGH_HUMIDITY_THRESHOLD);
            generatedAlerts.add(buildAlert(batch, "HIGH_HUMIDITY", desc));
        }

        // Lưu tất cả cảnh báo vào DB
        List<WeatherAlert> saved = weatherAlertRepository.saveAll(generatedAlerts);

        log.info("Generated {} weather alert(s) for batch '{}'", saved.size(), batch.getBatchName());

        return saved.stream().map(weatherAlertMapper::toDto).toList();
    }

    /**
     * Tóm tắt thời tiết hiện tại theo dạng DTO (không lưu DB).
     */
    public WeatherCurrentDto getWeatherInfo(Integer pBatchId) {
        PlantingBatch batch = plantingBatchRepository.findById(pBatchId)
                .orElseThrow(() -> new RuntimeException("PlantingBatch not found with id: " + pBatchId));
        return openMeteoService.getCurrentWeather(batch.getLocationCoords());
    }

    // -----------------------------------------------------------------------

    private WeatherAlert buildAlert(PlantingBatch batch, String alertType, String description) {
        return WeatherAlert.builder()
                .plantingBatch(batch)
                .alertType(alertType)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
