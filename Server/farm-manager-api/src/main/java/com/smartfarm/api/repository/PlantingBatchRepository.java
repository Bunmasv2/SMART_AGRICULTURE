package com.smartfarm.api.repository;

import com.smartfarm.api.entity.PlantingBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlantingBatchRepository extends JpaRepository<PlantingBatch, Long> {
    List<PlantingBatch> findByStatus(String status);
    List<PlantingBatch> findByCropCropId(Long cropId);
}
