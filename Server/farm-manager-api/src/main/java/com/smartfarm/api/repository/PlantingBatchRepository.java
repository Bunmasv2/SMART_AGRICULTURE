package com.smartfarm.api.repository;

import com.smartfarm.api.entity.PlantingBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlantingBatchRepository extends JpaRepository<PlantingBatch, Integer> {
    List<PlantingBatch> findByStatus(String status);

    List<PlantingBatch> findByCropCropId(Integer cropId);

    /**
     * Lấy PlantingBatch mới nhất có locationCoords.
     * Dùng @Query thay vì method name vì JPA parser không resolve đúng
     * field "pBatchId" (chữ p thường) khi tạo tên method.
     */
    @Query("SELECT p FROM PlantingBatch p WHERE p.locationCoords IS NOT NULL AND TRIM(p.locationCoords) != '' ORDER BY p.pBatchId DESC LIMIT 1")
    Optional<PlantingBatch> findLatestWithCoords();

    @Query("SELECT p FROM PlantingBatch p WHERE p.locationCoords IS NOT NULL AND TRIM(p.locationCoords) != ''")
    List<PlantingBatch> findAllWithCoords();
}
