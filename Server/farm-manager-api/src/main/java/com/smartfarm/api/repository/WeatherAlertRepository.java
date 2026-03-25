package com.smartfarm.api.repository;

import com.smartfarm.api.entity.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, Integer> {
    List<WeatherAlert> findByPlantingBatchPBatchId(Integer pBatchId);
}
