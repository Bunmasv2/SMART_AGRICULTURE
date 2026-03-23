package com.smartfarm.api.service;

import com.smartfarm.api.dto.NotificationDto;
import com.smartfarm.api.entity.Notification;
import com.smartfarm.api.mapper.NotificationMapper;
import com.smartfarm.api.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    public List<NotificationDto> findAll() {
        return notificationRepository.findAll().stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> findByBatchId(Integer pBatchId) {
        return notificationRepository.findByPlantingBatchPBatchId(pBatchId).stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> findUnread() {
        return notificationRepository.findByIsRead(false).stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<NotificationDto> findById(Integer id) {
        return notificationRepository.findById(id).map(notificationMapper::toDto);
    }

    /**
     * Đánh dấu notification đã đọc
     */
    @Transactional
    public NotificationDto markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toDto(saved);
    }

    public boolean deleteById(Integer id) {
        if (!notificationRepository.existsById(id)) return false;
        notificationRepository.deleteById(id);
        return true;
    }
}
