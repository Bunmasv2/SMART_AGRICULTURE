package com.smartfarm.api.repository;

import com.smartfarm.api.entity.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, Integer> {

    @Query("SELECT w FROM WeatherAlert w WHERE w.plantingBatch.pBatchId = :pBatchId")
    List<WeatherAlert> findByPlantingBatchPBatchId(Integer pBatchId);
}
