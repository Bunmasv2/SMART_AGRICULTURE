package com.smartfarm.api.repository;

import com.smartfarm.api.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByPlantingBatchPBatchId(Integer pBatchId);
    List<Task> findByAssignedToUserId(Integer userId);
    List<Task> findByStatus(String status);

    // Methods cho tính toán progress
    Long countByPlantingBatchPBatchId(Integer pBatchId);
    Long countByPlantingBatchPBatchIdAndStatus(Integer pBatchId, String status);
}
