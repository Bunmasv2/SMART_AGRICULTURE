package com.smartfarm.api.repository;

import com.smartfarm.api.entity.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {
    @Query("SELECT a FROM AiAnalysis a WHERE a.plantingBatch.pBatchId = :pBatchId")
    List<AiAnalysis> findByPlantingBatchPBatchId(Integer pBatchId);
}
