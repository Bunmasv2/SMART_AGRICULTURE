package com.smartfarm.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartfarm.api.entity.AiAnalysis;

@Repository
public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Integer> {
    @Query("SELECT a FROM AiAnalysis a LEFT JOIN a.plantingBatch p WHERE p.pBatchId = :pBatchId")
    
    Page<AiAnalysis> findByPlantingBatchPBatchId(@Param("pBatchId") Integer pBatchId, Pageable pageable);

    @Query("""
        SELECT a
        FROM AiAnalysis a
        LEFT JOIN a.plantingBatch p
        WHERE p.pBatchId = :pBatchId
        ORDER BY a.createdAt DESC, a.analysisId DESC
        """)
    List<AiAnalysis> findByPlantingBatchPBatchIdOrderByCreatedAtDesc(@Param("pBatchId") Integer pBatchId);

    @Query("""
        SELECT a
        FROM AiAnalysis a
        LEFT JOIN a.plantingBatch p
        WHERE p.pBatchId = :pBatchId
        ORDER BY a.createdAt ASC, a.analysisId ASC
        """)
    List<AiAnalysis> findByPlantingBatchPBatchIdOrderByCreatedAtAsc(@Param("pBatchId") Integer pBatchId);

    default List<AiAnalysis> findByPlantingBatchPBatchId(Integer pBatchId) {
        return findByPlantingBatchPBatchIdOrderByCreatedAtDesc(pBatchId);
    }

    default Optional<AiAnalysis> findLatestByBatchId(Integer pBatchId) {
        return findByPlantingBatchPBatchIdOrderByCreatedAtDesc(pBatchId).stream().findFirst();
    }
}
