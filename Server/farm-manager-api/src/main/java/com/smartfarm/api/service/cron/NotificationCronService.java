package com.smartfarm.api.service.cron;

import com.smartfarm.api.entity.AiAnalysis;
import com.smartfarm.api.entity.Notification;
import com.smartfarm.api.entity.PlantingBatch;
import com.smartfarm.api.repository.AiAnalysisRepository;
import com.smartfarm.api.repository.NotificationRepository;
import com.smartfarm.api.repository.PlantingBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý các tác vụ định kỳ (Cron Jobs)
 * Nhắc nhở user chụp ảnh lá cây để theo dõi tình trạng
 */
@Service
public class NotificationCronService {

    private final PlantingBatchRepository plantingBatchRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final NotificationRepository notificationRepository;

    // Số ngày tối đa không chụp ảnh trước khi nhắc nhở
    private static final long REMINDER_THRESHOLD_DAYS = 3;

    @Autowired
    public NotificationCronService(
            PlantingBatchRepository plantingBatchRepository,
            AiAnalysisRepository aiAnalysisRepository,
            NotificationRepository notificationRepository) {
        this.plantingBatchRepository = plantingBatchRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Cron job chạy mỗi ngày lúc 8h sáng
     * Kiểm tra và tạo thông báo nhắc chụp ảnh cho các lô trồng
     */
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void checkAndCreatePhotoReminders() {
        System.out.println("=== Bắt đầu kiểm tra nhắc nhở chụp ảnh lúc: " + LocalDateTime.now() + " ===");

        // 1. Tìm tất cả PlantingBatch đang ACTIVE
        List<PlantingBatch> activeBatches = plantingBatchRepository.findByStatus("ACTIVE");

        if (activeBatches.isEmpty()) {
            System.out.println("Không có lô trồng nào đang hoạt động.");
            return;
        }

        System.out.println("Tìm thấy " + activeBatches.size() + " lô trồng đang hoạt động.");

        int reminderCount = 0;

        // 2. Với mỗi batch, kiểm tra thời gian phân tích AI gần nhất
        for (PlantingBatch batch : activeBatches) {
            try {
                // Tìm bản ghi AiAnalysis mới nhất của batch này
                Optional<AiAnalysis> latestAnalysis = aiAnalysisRepository.findLatestByBatchId(batch.getPBatchId());

                boolean shouldRemind = false;

                if (latestAnalysis.isEmpty()) {
                    // Chưa từng có bản ghi AI analysis nào
                    shouldRemind = true;
                    System.out.println("Lô " + batch.getBatchName() + " chưa có phân tích AI nào.");
                } else {
                    // Tính số ngày từ lần phân tích gần nhất
                    LocalDateTime lastAnalysisTime = latestAnalysis.get().getCreatedAt();
                    long daysSinceLastAnalysis = ChronoUnit.DAYS.between(lastAnalysisTime, LocalDateTime.now());

                    if (daysSinceLastAnalysis >= REMINDER_THRESHOLD_DAYS) {
                        shouldRemind = true;
                        System.out.println("Lô " + batch.getBatchName() + " đã " + daysSinceLastAnalysis + " ngày không phân tích.");
                    }
                }

                // 3. Tạo notification nếu cần nhắc nhở
                if (shouldRemind) {
                    String message = String.format(
                            "Đã đến lúc cập nhật tình trạng cây cho Lô trồng [%s]. Vui lòng chụp ảnh lá cây!",
                            batch.getBatchName()
                    );

                    Notification notification = Notification.builder()
                            .plantingBatch(batch)
                            .message(message)
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build();

                    notificationRepository.save(notification);
                    reminderCount++;

                    System.out.println("✓ Đã tạo thông báo cho lô: " + batch.getBatchName());
                }

            } catch (Exception e) {
                System.err.println("Lỗi khi xử lý lô " + batch.getBatchName() + ": " + e.getMessage());
            }
        }

        System.out.println("=== Hoàn thành. Đã tạo " + reminderCount + " thông báo nhắc nhở. ===");
    }
}
