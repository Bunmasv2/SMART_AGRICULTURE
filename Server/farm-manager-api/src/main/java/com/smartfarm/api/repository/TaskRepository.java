package com.smartfarm.api.repository;

import com.smartfarm.api.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByPlantingBatchPBatchId(Long pBatchId);
    List<Task> findByAssignedToUserId(Long userId);
    List<Task> findByStatus(String status);
}
