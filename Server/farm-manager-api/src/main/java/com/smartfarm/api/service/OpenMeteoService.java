package com.smartfarm.api.service;

import com.smartfarm.api.dto.WeatherCurrentDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Service gọi Open-Meteo API (miễn phí, không cần API key).
 * Tài liệu: https://open-meteo.com/en/docs
 * <p>
 * locationCoords phải có định dạng "latitude,longitude", ví dụ:
 * "10.7769,106.7009"
 */
@Service
public class OpenMeteoService {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoService.class);

    private final RestClient restClient;

    @Autowired
    public OpenMeteoService(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Lấy dữ liệu thời tiết hiện tại cho tọa độ đã cho.
     *
     * @param locationCoords chuỗi "lat,lng", ví dụ "10.7769,106.7009"
     * @return WeatherCurrentDto hoặc null nếu parse tọa độ thất bại
     */
    public WeatherCurrentDto getCurrentWeather(String locationCoords) {
        if (locationCoords == null || locationCoords.isBlank()) {
            log.warn("locationCoords is null or blank, cannot call weather API");
            return null;
        }

        String[] parts = locationCoords.trim().split(",");
        if (parts.length < 2) {
            log.warn("Invalid locationCoords format: '{}'. Expected 'lat,lng'", locationCoords);
            return null;
        }

        String lat = parts[0].trim();
        String lng = parts[1].trim();

        try {
            WeatherCurrentDto response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/forecast")
                            .queryParam("latitude", lat)
                            .queryParam("longitude", lng)
                            .queryParam("current",
                                    "temperature_2m,precipitation_probability,weathercode," +
                                            "windspeed_10m,relative_humidity_2m,precipitation")
                            .queryParam("timezone", "Asia/Ho_Chi_Minh")
                            .build())
                    .retrieve()
                    .body(WeatherCurrentDto.class);

            log.info("Weather data fetched for coords ({}, {}): temp={}°C, rain={}%, windspeed={} km/h",
                    lat, lng,
                    response != null && response.getCurrent() != null ? response.getCurrent().getTemperature() : "N/A",
                    response != null && response.getCurrent() != null
                            ? response.getCurrent().getPrecipitationProbability()
                            : "N/A",
                    response != null && response.getCurrent() != null ? response.getCurrent().getWindSpeed() : "N/A");

            return response;
        } catch (Exception e) {
            log.error("Failed to fetch weather data for coords '{}': {}", locationCoords, e.getMessage());
            return null;
        }
    }
}
