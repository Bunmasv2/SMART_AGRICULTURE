package com.smartfarm.api.repository;

import com.smartfarm.api.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StageRepository extends JpaRepository<Stage, Integer> {
    List<Stage> findByProcessProcessId(Integer processId);
}
