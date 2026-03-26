package com.smartfarm.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Crops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crop_id")
    private Integer cropId;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(name = "variety", length = 100)
    private String variety;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "rain_probability_threshold")
    private Integer rainProbabilityThreshold;

    @Column(name = "high_temp_threshold")
    private Double highTempThreshold;

    @Column(name = "low_temp_threshold")
    private Double lowTempThreshold;

    @Column(name = "strong_wind_threshold")
    private Double strongWindThreshold;

    @Column(name = "high_humidity_threshold")
    private Integer highHumidityThreshold;

    @Column(name = "storm_weather_code")
    private Integer stormWeatherCode;
}
