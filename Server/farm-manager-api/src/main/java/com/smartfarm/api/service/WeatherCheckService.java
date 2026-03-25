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
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.smartfarm.api.entity.User;
import com.smartfarm.api.repository.UserRepository;

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

    // ===== Ngưỡng cảnh báo mặc định =====
    private static final int DEFAULT_RAIN_PROBABILITY_THRESHOLD = 70; // %
    private static final double DEFAULT_HIGH_TEMP_THRESHOLD = 30.0; // °C
    private static final double DEFAULT_LOW_TEMP_THRESHOLD = 15.0; // °C
    private static final double DEFAULT_STRONG_WIND_THRESHOLD = 40.0; // km/h
    private static final int DEFAULT_HIGH_HUMIDITY_THRESHOLD = 90; // %
    private static final int DEFAULT_STORM_WEATHER_CODE = 95; // WMO code


    private final PlantingBatchRepository plantingBatchRepository;
    private final WeatherAlertRepository weatherAlertRepository;
    private final WeatherAlertMapper weatherAlertMapper;
    private final OpenMeteoService openMeteoService;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Autowired
    public WeatherCheckService(PlantingBatchRepository plantingBatchRepository,
            WeatherAlertRepository weatherAlertRepository,
            WeatherAlertMapper weatherAlertMapper,
            OpenMeteoService openMeteoService,
            SimpMessagingTemplate messagingTemplate,
            EmailService emailService,
            UserRepository userRepository) {
        this.plantingBatchRepository = plantingBatchRepository;
        this.weatherAlertRepository = weatherAlertRepository;
        this.weatherAlertMapper = weatherAlertMapper;
        this.openMeteoService = openMeteoService;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
        this.userRepository = userRepository;
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
        
        // --- Phát trực tiếp thông tin thời tiết Data gốc (chưa cảnh báo) qua WebSocket ---
        messagingTemplate.convertAndSend("/topic/weather/" + pBatchId, weatherData);

        List<WeatherAlert> generatedAlerts = new ArrayList<>();

        log.info(
                "Checking weather alerts for batch '{}' (coords: {}): temp={}, rain={}%, wind={} km/h, humidity={}%, code={}",
                batch.getBatchName(), locationCoords,
                w.getTemperature(), w.getPrecipitationProbability(),
                w.getWindSpeed(), w.getRelativeHumidity(), w.getWeatherCode());

        Double highTempThreshold = batch.getCrop() != null && batch.getCrop().getHighTempThreshold() != null ? batch.getCrop().getHighTempThreshold() : DEFAULT_HIGH_TEMP_THRESHOLD;
        Double lowTempThreshold = batch.getCrop() != null && batch.getCrop().getLowTempThreshold() != null ? batch.getCrop().getLowTempThreshold() : DEFAULT_LOW_TEMP_THRESHOLD;
        Integer rainProbThreshold = batch.getCrop() != null && batch.getCrop().getRainProbabilityThreshold() != null ? batch.getCrop().getRainProbabilityThreshold() : DEFAULT_RAIN_PROBABILITY_THRESHOLD;
        Double windThreshold = batch.getCrop() != null && batch.getCrop().getStrongWindThreshold() != null ? batch.getCrop().getStrongWindThreshold() : DEFAULT_STRONG_WIND_THRESHOLD;
        Integer humidityThreshold = batch.getCrop() != null && batch.getCrop().getHighHumidityThreshold() != null ? batch.getCrop().getHighHumidityThreshold() : DEFAULT_HIGH_HUMIDITY_THRESHOLD;
        Integer stormCodeThreshold = batch.getCrop() != null && batch.getCrop().getStormWeatherCode() != null ? batch.getCrop().getStormWeatherCode() : DEFAULT_STORM_WEATHER_CODE;

        // ── 1. Cảnh báo thời tiết xấu theo ngưỡng đã cài đặt ──────────────────────
        if (w.getWeatherCode() != null && w.getWeatherCode() >= stormCodeThreshold) {
            String weatherName = weatherCodeToText(w.getWeatherCode());
            String desc = String.format(
                    "⚠️ CẢNH BÁO THỜI TIẾT - Hiện tại: %s. " +
                            "Thời tiết đã đạt hoặc vượt ngưỡng nguy hiểm bạn cấu hình. " +
                            "Hãy chủ động đưa ra biện pháp xử lý để đảm bảo an toàn cho cây trồng.",
                    weatherName);
            generatedAlerts.add(buildAlert(batch, "STORM", desc));
        }

        // ── 2. Cảnh báo nguy cơ mưa to ────────────────────────────────────
        if (w.getPrecipitationProbability() != null
                && w.getPrecipitationProbability() >= rainProbThreshold) {
            String desc = String.format(
                    "🌧️ NGUY CƠ MƯA LỚN - Xác suất mưa hiện tại: %d%%. " +
                            "Vui lòng che phủ vật tư phân bón, hạt giống và thu hoạch sớm nếu cần thiết. " +
                            "Kiểm tra hệ thống thoát nước trên ruộng.",
                    w.getPrecipitationProbability());
            generatedAlerts.add(buildAlert(batch, "RAIN_RISK", desc));
        }

        // ── 3. Cảnh báo nhiệt độ cao ───────────────────────────────────────
        if (w.getTemperature() != null && w.getTemperature() >= highTempThreshold) {
            String desc = String.format(
                    "🌡️ NHIỆT ĐỘ CAO - Nhiệt độ hiện tại: %.1f°C (ngưỡng cảnh báo: %.0f°C). " +
                            "Hãy tưới nước cho cây ngay lập tức, tốt nhất vào buổi sáng sớm hoặc chiều tối. " +
                            "Sử dụng lưới che nắng để giảm tác động nhiệt.",
                    w.getTemperature(), highTempThreshold);
            generatedAlerts.add(buildAlert(batch, "HIGH_TEMP", desc));
        }

        // ── 4. Cảnh báo nhiệt độ thấp ─────────────────────────────────────
        if (w.getTemperature() != null && w.getTemperature() <= lowTempThreshold) {
            String desc = String.format(
                    "❄️ NHIỆT ĐỘ THẤP - Nhiệt độ hiện tại: %.1f°C (ngưỡng cảnh báo: %.0f°C). " +
                            "Che phủ cây trồng bằng nilon hoặc vải không dệt để tránh sương giá. " +
                            "Hạn chế tưới nước trong điều kiện nhiệt độ thấp.",
                    w.getTemperature(), lowTempThreshold);
            generatedAlerts.add(buildAlert(batch, "LOW_TEMP", desc));
        }

        // ── 5. Cảnh báo gió mạnh ──────────────────────────────────────────
        if (w.getWindSpeed() != null && w.getWindSpeed() >= windThreshold) {
            String desc = String.format(
                    "💨 GIÓ MẠNH - Tốc độ gió hiện tại: %.1f km/h (ngưỡng cảnh báo: %.0f km/h). " +
                            "Kiểm tra và cố định giàn, cọc chống cho cây. " +
                            "Tạm hoãn phun thuốc và bón phân để tránh bay hơi không cần thiết.",
                    w.getWindSpeed(), windThreshold);
            generatedAlerts.add(buildAlert(batch, "STRONG_WIND", desc));
        }

        // ── 6. Cảnh báo độ ẩm cao ─────────────────────────────────────────
        if (w.getRelativeHumidity() != null && w.getRelativeHumidity() >= humidityThreshold) {
            String desc = String.format(
                    "💧 ĐỘ ẨM RẤT CAO - Độ ẩm hiện tại: %d%% (ngưỡng cảnh báo: %d%%). " +
                            "Nguy cơ cao phát sinh nấm bệnh và sâu bệnh hại. " +
                            "Kiểm tra cây thường xuyên, thông gió tốt và cân nhắc phòng ngừa bệnh kịp thời.",
                    w.getRelativeHumidity(), humidityThreshold);
            generatedAlerts.add(buildAlert(batch, "HIGH_HUMIDITY", desc));
        }

        // Lưu tất cả cảnh báo vào DB
        List<WeatherAlert> saved = weatherAlertRepository.saveAll(generatedAlerts);

        log.info("Generated {} weather alert(s) for batch '{}'", saved.size(), batch.getBatchName());

        List<WeatherAlertDto> alertDtos = saved.stream().map(weatherAlertMapper::toDto).toList();

        if (!alertDtos.isEmpty()) {
            pushWebSockets(alertDtos);
            sendBulkEmailToUsers(alertDtos);
        }

        return alertDtos;
    }

    public void checkAllLocationsAndGenerateAlerts() {
        List<PlantingBatch> allBatches = plantingBatchRepository.findAllWithCoords();
        if (allBatches.isEmpty()) {
            log.info("Không có PlantingBatch nào có tọa độ hợp lệ để kiểm tra thời tiết.");
            return;
        }

        // Nhóm batches theo locationCoords để tránh gọi API lặp lại
        Map<String, List<PlantingBatch>> batchesByLocation = allBatches.stream()
                .collect(Collectors.groupingBy(PlantingBatch::getLocationCoords));

        List<WeatherAlertDto> allGeneratedAlerts = new ArrayList<>();

        for (Map.Entry<String, List<PlantingBatch>> entry : batchesByLocation.entrySet()) {
            String locationCoords = entry.getKey();
            List<PlantingBatch> batchesAtLocation = entry.getValue();

            try {
                // Chỉ gọi API 1 lần cho mỗi vị trí
                WeatherCurrentDto weatherData = openMeteoService.getCurrentWeather(locationCoords);
                if (weatherData == null || weatherData.getCurrent() == null)
                    continue;

                WeatherCurrentDto.Current w = weatherData.getCurrent();

                // --- Phát trực tiếp Data gốc qua WebSocket cho tất cả các batch (giải pháp realtime) ---
                for (PlantingBatch batch : batchesAtLocation) {
                    messagingTemplate.convertAndSend("/topic/weather/" + batch.getPBatchId(), weatherData);
                }

                List<WeatherAlert> allAlertsToSave = new ArrayList<>();
                for (PlantingBatch batch : batchesAtLocation) {
                    Double highTempThreshold = batch.getCrop() != null && batch.getCrop().getHighTempThreshold() != null ? batch.getCrop().getHighTempThreshold() : DEFAULT_HIGH_TEMP_THRESHOLD;
                    Double lowTempThreshold = batch.getCrop() != null && batch.getCrop().getLowTempThreshold() != null ? batch.getCrop().getLowTempThreshold() : DEFAULT_LOW_TEMP_THRESHOLD;
                    Integer rainProbThreshold = batch.getCrop() != null && batch.getCrop().getRainProbabilityThreshold() != null ? batch.getCrop().getRainProbabilityThreshold() : DEFAULT_RAIN_PROBABILITY_THRESHOLD;
                    Double windThreshold = batch.getCrop() != null && batch.getCrop().getStrongWindThreshold() != null ? batch.getCrop().getStrongWindThreshold() : DEFAULT_STRONG_WIND_THRESHOLD;
                    Integer humidityThreshold = batch.getCrop() != null && batch.getCrop().getHighHumidityThreshold() != null ? batch.getCrop().getHighHumidityThreshold() : DEFAULT_HIGH_HUMIDITY_THRESHOLD;
                    Integer stormCodeThreshold = batch.getCrop() != null && batch.getCrop().getStormWeatherCode() != null ? batch.getCrop().getStormWeatherCode() : DEFAULT_STORM_WEATHER_CODE;

                    if (w.getWeatherCode() != null && w.getWeatherCode() >= stormCodeThreshold) {
                        String weatherName = weatherCodeToText(w.getWeatherCode());
                        allAlertsToSave.add(buildAlert(batch, "STORM", 
                                String.format("⚠️ CẢNH BÁO THỜI TIẾT - Hiện tại: %s. Hãy đảm bảo an toàn cho cây trồng.", weatherName)));
                    }
                    if (w.getPrecipitationProbability() != null && w.getPrecipitationProbability() >= rainProbThreshold) {
                        allAlertsToSave.add(buildAlert(batch, "RAIN_RISK", 
                                String.format("🌧️ NGUY CƠ MƯA LỚN - Xác suất: %d%%. Che phủ cây trồng.", w.getPrecipitationProbability())));
                    }
                    if (w.getTemperature() != null && w.getTemperature() >= highTempThreshold) {
                        allAlertsToSave.add(buildAlert(batch, "HIGH_TEMP", 
                                String.format("🌡️ NHIỆT ĐỘ CAO - %.1f°C. Hãy tưới nước...", w.getTemperature())));
                    }
                    if (w.getTemperature() != null && w.getTemperature() <= lowTempThreshold) {
                        allAlertsToSave.add(buildAlert(batch, "LOW_TEMP", 
                                String.format("❄️ NHIỆT ĐỘ THẤP - %.1f°C. Che phủ chống sương giá.", w.getTemperature())));
                    }
                    if (w.getWindSpeed() != null && w.getWindSpeed() >= windThreshold) {
                        allAlertsToSave.add(buildAlert(batch, "STRONG_WIND", 
                                String.format("💨 GIÓ MẠNH - %.1f km/h.", w.getWindSpeed())));
                    }
                    if (w.getRelativeHumidity() != null && w.getRelativeHumidity() >= humidityThreshold) {
                        allAlertsToSave.add(buildAlert(batch, "HIGH_HUMIDITY", 
                                String.format("💧 ĐỘ ẨM CAO - %d%%. Tuần hoàn không khí...", w.getRelativeHumidity())));
                    }
                }

                if (allAlertsToSave.isEmpty()) continue;

                List<WeatherAlert> savedAlerts = weatherAlertRepository.saveAll(allAlertsToSave);
                List<WeatherAlertDto> alertDtos = savedAlerts.stream().map(weatherAlertMapper::toDto).toList();

                allGeneratedAlerts.addAll(alertDtos);

                // Push WebSockets ra real-time trực tiếp trong loop hoặc gom lại
                if (!alertDtos.isEmpty()) {
                    pushWebSockets(alertDtos);
                }

            } catch (Exception e) {
                log.error("Lỗi khi kiểm tra thời tiết gộp cho {}: {}", locationCoords, e.getMessage());
            }
        }

        // Gửi Gộp 1 Email Duy Nhất nếu có cảnh báo!
        if (!allGeneratedAlerts.isEmpty()) {
            sendBulkEmailToUsers(allGeneratedAlerts);
        }
    }

    private void pushWebSockets(List<WeatherAlertDto> alertDtos) {
        for (WeatherAlertDto dto : alertDtos) {
            messagingTemplate.convertAndSend("/topic/weather-alerts", dto);
        }
    }

    private void sendBulkEmailToUsers(List<WeatherAlertDto> alerts) {
        List<User> usersToNotify = userRepository.findAll().stream()
                .filter(u -> u.isVerified() && u.getEmail() != null)
                .toList();

        for (User user : usersToNotify) {
            try {
                emailService.sendSummarizedWeatherAlertEmail(user.getEmail(), user.getFullName(), alerts);
            } catch (Exception e) {
                log.error("Lỗi khi gửi mail cảnh báo tổng hợp: {}", e.getMessage());
            }
        }
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

    private String weatherCodeToText(Integer code) {
        if (code == null) return "Không xác định";
        if (code == 0) return "Trời quang";
        if (code <= 3) return "Nhiều mây";
        if (code <= 9) return "Sương mù nhẹ";
        if (code <= 19) return "Mưa phùn";
        if (code <= 29) return "Mưa rào";
        if (code <= 39) return "Tuyết";
        if (code <= 49) return "Sương mù";
        if (code <= 59) return "Mưa phùn nặng hạt";
        if (code <= 69) return "Mưa vừa đến to";
        if (code <= 79) return "Tuyết rơi nhiều";
        if (code <= 84) return "Mưa rào lớn";
        if (code <= 94) return "Tuyết rào";
        return "Giông bão";
    }

    private WeatherAlert buildAlert(PlantingBatch batch, String alertType, String description) {
        return WeatherAlert.builder()
                .plantingBatch(batch)
                .alertType(alertType)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
