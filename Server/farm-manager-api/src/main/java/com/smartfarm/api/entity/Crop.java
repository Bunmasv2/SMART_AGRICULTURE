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
    private Long cropId;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(name = "variety", length = 100)
    private String variety;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
