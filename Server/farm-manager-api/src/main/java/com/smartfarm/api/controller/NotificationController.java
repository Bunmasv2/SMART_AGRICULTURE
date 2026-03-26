package com.smartfarm.api.controller;

import com.smartfarm.api.dto.ApiResponse;
import com.smartfarm.api.dto.NotificationDto;
import com.smartfarm.api.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Lấy tất cả notifications
     * Có thể filter theo pBatchId hoặc chỉ lấy chưa đọc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getAll(
            @RequestParam(required = false) Integer pBatchId,
            @RequestParam(required = false) Boolean unreadOnly) {
        try {
            List<NotificationDto> data;

            if (pBatchId != null) {
                data = notificationService.findByBatchId(pBatchId);
            } else if (unreadOnly != null && unreadOnly) {
                data = notificationService.findUnread();
            } else {
                data = notificationService.findAll();
            }

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * Lấy notification theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationDto>> getById(@PathVariable Integer id) {
        return notificationService.findById(id)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.notFound("Notification not found with id: " + id)));
    }

    /**
     * Đánh dấu notification đã đọc
     */
    @PutMapping("/{id}/mark-read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(@PathVariable Integer id) {
        try {
            NotificationDto notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }

    /**
     * Xóa notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        try {
            if (notificationService.deleteById(id)) {
                return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.notFound("Notification not found with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
