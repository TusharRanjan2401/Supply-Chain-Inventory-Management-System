package com.SupplyChainMngmt.com.Notificationservice.Notificationservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationEvent {
    private String notificationId;
    private String userEmail;
    private String message;
    private String type;
    private Instant timestamp;
}
