package com.smartfarm.api.repository;

import com.smartfarm.api.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    @Query("SELECT t FROM Task t WHERE t.plantingBatch.pBatchId = :pBatchId")
    List<Task> findByPlantingBatchPBatchId(Integer pBatchId);
    List<Task> findByAssignedToUserId(Integer userId);
    List<Task> findByStatus(String status);
}
