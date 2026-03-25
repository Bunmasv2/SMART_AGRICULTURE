package com.smartfarm.api.repository;

import com.smartfarm.api.entity.TaskTemplate;
// ĐỔI DÒNG NÀY:
import org.springframework.data.jpa.repository.Query; 
// THÊM DÒNG NÀY ĐỂ TRÁNH LỖI PARAM:
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {
    
    List<TaskTemplate> findByStageStageId(Long stageId);

    // Sử dụng đúng @Query của JPA và thêm @Param cho chắc chắn
    @Query("SELECT t FROM TaskTemplate t WHERE t.stage.process.processId = :processId")
    List<TaskTemplate> findByProcessId(@Param("processId") Long processId);
}