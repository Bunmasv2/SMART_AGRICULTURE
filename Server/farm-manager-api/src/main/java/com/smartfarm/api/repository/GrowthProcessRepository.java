package com.smartfarm.api.repository;

import com.smartfarm.api.entity.GrowthProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GrowthProcessRepository extends JpaRepository<GrowthProcess, Integer> {
    List<GrowthProcess> findByCropCropId(Integer cropId);
}
