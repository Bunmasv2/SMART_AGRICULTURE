package com.smartfarm.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartfarm.api.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByPlantingBatchPBatchId(Integer pBatchId);
    List<Notification> findByIsRead(Boolean isRead);
}
