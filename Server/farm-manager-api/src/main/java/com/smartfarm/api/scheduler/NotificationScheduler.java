package com.smartfarm.api.scheduler;

import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.entity.InventoryItem;
import com.smartfarm.api.entity.User;
import com.smartfarm.api.repository.InventoryBatchRepository;
import com.smartfarm.api.repository.InventoryItemRepository;
import com.smartfarm.api.repository.UserRepository;
import com.smartfarm.api.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final InventoryBatchRepository inventoryBatchRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Chạy lúc 8:00 sáng mỗi ngày
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendDailyInventoryAlerts() {
        log.info("Bắt đầu kiểm tra tồn kho và hạn sử dụng để gửi thông báo...");

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);

        // 1. Lấy danh sách các lô đã hết hạn
        List<InventoryBatch> expired = inventoryBatchRepository.findByExpiryDateBefore(today);
        
        // 2. Lấy danh sách các lô sắp hết hạn (trong 30 ngày tới)
        List<InventoryBatch> nearExpiry = inventoryBatchRepository.findByExpiryDateBetween(today, thirtyDaysFromNow);

        // 3. Lấy danh sách các mặt hàng tồn kho thấp
        List<InventoryItem> lowStock = inventoryItemRepository.findLowStockItems();

        if (expired.isEmpty() && nearExpiry.isEmpty() && lowStock.isEmpty()) {
            log.info("Không có cảnh báo tồn kho nào cần gửi.");
            return;
        }

        // 4. Lấy danh sách tất cả các người dùng đã xác thực để gửi mail
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> u.isVerified() && u.getEmail() != null)
                .collect(Collectors.toList());

        if (recipients.isEmpty()) {
            log.warn("Không tìm thấy người dùng nào đã xác thực để gửi cảnh báo!");
            return;
        }

        log.info("Gửi cảnh báo tới {} người dùng.", recipients.size());

        for (User user : recipients) {
            try {
                emailService.sendInventoryAlertEmail(user.getEmail(), expired, nearExpiry, lowStock);
                log.info("Đã gửi email cảnh báo thành công tới: {}", user.getEmail());
            } catch (MessagingException e) {
                log.error("Lỗi khi gửi email cảnh báo tới {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }
}
