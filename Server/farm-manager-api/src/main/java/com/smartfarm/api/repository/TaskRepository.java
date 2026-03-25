package com.smartfarm.api.repository;

import com.smartfarm.api.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    // Sử dụng @Query để viết rõ câu lệnh JPQL
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.taskTemplate tt " +
            "LEFT JOIN FETCH tt.stage s " +
            "WHERE t.plantingBatch.pBatchId = :batchId " +
            "ORDER BY s.stageId, t.plannedDate ASC")
    List<Task> findTasksWithStageByBatchId(@Param("batchId") Integer batchId);

    @Query("SELECT t FROM Task t WHERE t.plantingBatch.pBatchId = :batchId")
    List<Task> findByBatchId(@Param("batchId") Integer batchId);

    List<Task> findByAssignedToUserId(Integer userId);
    @Query("SELECT t FROM Task t WHERE t.plantingBatch.pBatchId = :pBatchId")
    List<Task> findByPlantingBatchPBatchId(Integer pBatchId);
    List<Task> findByStatus(String status);

    // Nếu hàm này cũng lỗi, bạn có thể sửa tương tự:
    @Query("SELECT t FROM Task t WHERE t.plantingBatch.pBatchId = :batchId ORDER BY t.plannedDate ASC")
    List<Task> findTasksByBatchIdOrderByPlannedDateAsc(@Param("batchId") Integer batchId);
}