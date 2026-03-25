package com.smartfarm.api.service;

import com.smartfarm.api.entity.InventoryBatch;
import com.smartfarm.api.entity.InventoryItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("Smart Farm <alerts@smartfarm.com>");
        helper.setTo(to);
        helper.setSubject("Mã xác nhận tài khoản Smart Farm");

        StringBuilder content = new StringBuilder();
        content.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>");
        content.append("<h2 style='color: #2e7d32; text-align: center;'>Chào mừng bạn đến với Smart Farm</h2>");
        content.append("<p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quá trình đăng ký:</p>");
        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1b5e20; background-color: #e8f5e9; padding: 10px 20px; border-radius: 5px;'>");
        content.append(code);
        content.append("</span>");
        content.append("</div>");
        content.append("<p>Mã này sẽ hết hạn sau 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>");
        content.append("<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>");
        content.append("<p style='font-size: 12px; color: #888; text-align: center;'>Đây là email tự động từ Smart Farm Management System.</p>");
        content.append("</div>");

        helper.setText(content.toString(), true);
        mailSender.send(message);
    }

    @Async
    public void sendInventoryAlertEmail(String to, List<InventoryBatch> expired, List<InventoryBatch> nearExpiry, List<InventoryItem> lowStock) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("Smart Farm <alerts@smartfarm.com>");
        helper.setTo(to);
        helper.setSubject("Cảnh báo Hệ thống Giám sát Hạt giống - " + java.time.LocalDate.now());

        StringBuilder content = new StringBuilder();
        content.append("<div style='font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>");
        content.append("<h2 style='color: #d32f2f; text-align: center;'>Báo cáo Cảnh báo Tồn kho & Hạn sử dụng</h2>");
        content.append("<p>Chào quản trị viên,</p>");
        content.append("<p>Hệ thống Smart Farm đã phát hiện các vấn đề cần chú ý sau:</p>");

        // 1. Expired Batches
        if (!expired.isEmpty()) {
            content.append("<h3 style='color: #d32f2f;'>🔴 Đã hết hạn</h3>");
            content.append("<table style='width: 100%; border-collapse: collapse;'>");
            content.append("<tr style='background-color: #fce4ec;'><th style='border: 1px solid #ddd; padding: 8px;'>Tên mặt hàng</th><th style='border: 1px solid #ddd; padding: 8px;'>Số lượng</th><th style='border: 1px solid #ddd; padding: 8px;'>Ngày hết hạn</th></tr>");
            for (InventoryBatch b : expired) {
                content.append("<tr>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(b.getItem().getItemName()).append("</td>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(b.getQuantity()).append(" kg</td>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px; color: red;'>").append(b.getExpiryDate()).append("</td>");
                content.append("</tr>");
            }
            content.append("</table>");
        }

        // 2. Near Expiry Batches
        if (!nearExpiry.isEmpty()) {
            content.append("<h3 style='color: #f57c00;'>🟠 Sắp hết hạn (trong vòng 30 ngày)</h3>");
            content.append("<table style='width: 100%; border-collapse: collapse;'>");
            content.append("<tr style='background-color: #fff3e0;'><th style='border: 1px solid #ddd; padding: 8px;'>Tên mặt hàng</th><th style='border: 1px solid #ddd; padding: 8px;'>Số lượng</th><th style='border: 1px solid #ddd; padding: 8px;'>Ngày hết hạn</th></tr>");
            for (InventoryBatch b : nearExpiry) {
                content.append("<tr>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(b.getItem().getItemName()).append("</td>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(b.getQuantity()).append(" kg</td>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(b.getExpiryDate()).append("</td>");
                content.append("</tr>");
            }
            content.append("</table>");
        }

        // 3. Low Stock Items
        if (!lowStock.isEmpty()) {
            content.append("<h3 style='color: #1976d2;'>🔵 Tồn kho thấp (dưới ngưỡng)</h3>");
            content.append("<table style='width: 100%; border-collapse: collapse;'>");
            content.append("<tr style='background-color: #e3f2fd;'><th style='border: 1px solid #ddd; padding: 8px;'>Tên mặt hàng</th><th style='border: 1px solid #ddd; padding: 8px;'>Tồn kho hiện tại</th><th style='border: 1px solid #ddd; padding: 8px;'>Ngưỡng tối thiểu</th></tr>");
            for (InventoryItem i : lowStock) {
                content.append("<tr>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(i.getItemName()).append("</td>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append("Xem chi tiết trong hệ thống").append("</td>");
                content.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(i.getMinThreshold()).append(" kg</td>");
                content.append("</tr>");
            }
            content.append("</table>");
        }

        content.append("<p style='margin-top: 20px;'>Vui lòng đăng nhập vào hệ thống để xử lý các vấn đề trên.</p>");
        content.append("<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>");
        content.append("<p style='font-size: 12px; color: #888; text-align: center;'>Đây là email tự động từ Smart Farm Management System.</p>");
        content.append("</div>");

        helper.setText(content.toString(), true);
        mailSender.send(message);
    }
}
