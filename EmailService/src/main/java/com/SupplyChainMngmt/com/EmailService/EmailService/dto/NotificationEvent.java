package com.SupplyChainMngmt.com.EmailService.EmailService.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class NotificationEvent {
    private String notificationId;
    private String userEmail;
    private String message;
    private String type;
    private Instant timestamp;
}
