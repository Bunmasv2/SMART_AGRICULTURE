package com.smartfarm.api.repository;

import com.smartfarm.api.entity.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {
    /**
     * Tìm tất cả AiAnalysis theo pBatchId, sắp xếp theo ngày tạo giảm dần (mới nhất trước)
     */
    @Query("SELECT a FROM AiAnalysis a WHERE a.plantingBatch.pBatchId = :pBatchId ORDER BY a.createdAt DESC")
    List<AiAnalysis> findByPlantingBatchPBatchId(@Param("pBatchId") Integer pBatchId);

    /**
     * Tìm bản ghi AiAnalysis mới nhất của một batch
     * (Sắp xếp theo createdAt giảm dần, lấy 1 bản ghi đầu tiên)
     */
    @Query("SELECT a FROM AiAnalysis a WHERE a.plantingBatch.pBatchId = :pBatchId ORDER BY a.createdAt DESC LIMIT 1")
    Optional<AiAnalysis> findLatestByBatchId(@Param("pBatchId") Integer pBatchId);
}
