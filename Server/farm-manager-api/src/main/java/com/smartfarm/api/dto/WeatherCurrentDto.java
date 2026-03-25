package com.smartfarm.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO mapping response từ Open-Meteo API
 * Endpoint: https://api.open-meteo.com/v1/forecast?...&current=...
 */
@Data
public class WeatherCurrentDto {

    @JsonProperty("current")
    private Current current;

    @Data
    public static class Current {

        /** Nhiệt độ (°C) */
        @JsonProperty("temperature_2m")
        private Double temperature;

        /** Xác suất mưa (%) */
        @JsonProperty("precipitation_probability")
        private Integer precipitationProbability;

        /** Mã thời tiết WMO (0=quang, 95+=giông bão...) */
        @JsonProperty("weathercode")
        private Integer weatherCode;

        /** Tốc độ gió (km/h) */
        @JsonProperty("windspeed_10m")
        private Double windSpeed;

        /** Độ ẩm tương đối (%) */
        @JsonProperty("relative_humidity_2m")
        private Integer relativeHumidity;

        /** Lượng mưa hiện tại (mm) */
        @JsonProperty("precipitation")
        private Double precipitation;
    }
}
