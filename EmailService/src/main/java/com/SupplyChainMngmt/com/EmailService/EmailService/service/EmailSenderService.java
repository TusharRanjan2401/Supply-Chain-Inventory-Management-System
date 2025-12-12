package com.SupplyChainMngmt.com.EmailService.EmailService.service;

import com.SupplyChainMngmt.com.EmailService.EmailService.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderService {

    private final JavaMailSender mailSender;

    @Value("${email.sender}")
    private String senderEmail;

    @Value("${email.receiver}")
    private String receiverEmail;

    public void sendNotificationEmail(NotificationEvent event){
        try{
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(senderEmail);
            mailMessage.setTo(receiverEmail);
            mailMessage.setSubject("Supply chain notification "+event.getType());
            mailMessage.setText(buildEmailBody(event));

            log.info("📧 Sending email from {} to {} for notificationId={}",
                    senderEmail, receiverEmail, event.getNotificationId());

            mailSender.send(mailMessage);

            log.info("Email sent successfully for notificationId={}", event.getNotificationId());
        } catch (Exception e) {
            log.error("Failed to send email for notificationId={}", event.getNotificationId(), e);
        }
        }

        private String buildEmailBody(NotificationEvent event){
        StringBuilder sb = new StringBuilder();
        sb.append("Hello,\n\n");
            sb.append("Type: ").append(event.getType()).append("\n");
            sb.append("Message: ").append(event.getMessage()).append("\n");
            sb.append("Notification ID: ").append(event.getNotificationId()).append("\n");
            sb.append("Timestamp: ").append(event.getTimestamp()).append("\n\n");
            sb.append("Regards,\n");
            sb.append("Supply Chain & Inventory Management System");
            return sb.toString();
    }
}
