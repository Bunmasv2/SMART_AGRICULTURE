package com.smartfarm.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("Smart Farm <noreply@smartfarm.com>");
        helper.setTo(to);
        helper.setSubject("Mã xác nhận đăng ký Smart Farm");

        String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>"
                + "<h2 style='color: #2c9b4e; text-align: center;'>Xác nhận đăng ký</h2>"
                + "<p>Chào bạn,</p>"
                + "<p>Cảm ơn bạn đã đăng ký tài khoản tại <b>Smart Farm Management System</b>.</p>"
                + "<p>Mã xác nhận của bạn là:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<span style='font-size: 32px; font-weight: bold; padding: 10px 20px; background-color: #f4f4f4; border-radius: 5px; letter-spacing: 5px; color: #333;'>" + code + "</span>"
                + "</div>"
                + "<p>Mã này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>"
                + "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "<p style='font-size: 12px; color: #888; text-align: center;'>Đây là email tự động, vui lòng không trả lời email này.</p>"
                + "</div>";

        helper.setText(content, true);
        mailSender.send(message);
    }

    public void sendSummarizedWeatherAlertEmail(String to, String fullName, java.util.List<com.smartfarm.api.dto.WeatherAlertDto> alerts) throws MessagingException {
        if (alerts == null || alerts.isEmpty()) return;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("Smart Farm <noreply@smartfarm.com>");
        helper.setTo(to);
        helper.setSubject("⚠️ Cảnh báo Thời tiết Định kỳ - Smart Farm");

        StringBuilder content = new StringBuilder();
        content.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffcccc; border-radius: 10px; background-color: #fffafafa;'>");
        content.append("<h2 style='color: #d9534f; text-align: center;'>⚠️ Ghi Nhận Thời Tiết Xấu</h2>");
        content.append("<p>Chào <b>").append(fullName).append("</b>,</p>");
        content.append("<p>Trong lần tự động rà soát định kỳ hệ thống đã tự động ghi nhận <b>").append(alerts.size()).append("</b> cảnh báo thời tiết mới liên quan đến các lô trồng của bạn:</p>");
        
        for (com.smartfarm.api.dto.WeatherAlertDto alert : alerts) {
            content.append("<table style='width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; background: #fff;'>");
            content.append("  <tr><td style='padding: 10px; border: 1px solid #ddd; width: 30%; font-weight: bold; color: #555;'>Mùa vụ/Lô</td>");
            content.append("      <td style='padding: 10px; border: 1px solid #ddd; font-weight: bold;'>").append(alert.getBatchName()).append("</td></tr>");
            content.append("  <tr><td style='padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #555;'>Loại cảnh báo</td>");
            content.append("      <td style='padding: 10px; border: 1px solid #ddd; color: #d9534f; font-weight: bold;'>").append(alert.getAlertType()).append("</td></tr>");
            content.append("  <tr><td style='padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #555;'>Chi tiết</td>");
            content.append("      <td style='padding: 10px; border: 1px solid #ddd;'>").append(alert.getDescription()).append("</td></tr>");
            content.append("</table>");
        }

        content.append("<p style='color: #333;'>Vui lòng chú ý có biện pháp xử lý kịp thời để tránh tác động xấu rủi ro. Bạn có thể đăng nhập Farm Manager App để theo dõi chi tiết.</p>");
        content.append("<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>");
        content.append("<p style='font-size: 12px; color: #888; text-align: center;'>Hệ thống Smart Farm Auto-Scheduler.</p>");
        content.append("</div>");

        helper.setText(content.toString(), true);
        mailSender.send(message);
    }
}
