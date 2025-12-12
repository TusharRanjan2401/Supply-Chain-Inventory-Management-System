package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.exception.payload;

import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@Builder
public class ApiResponse {
    private String message;
    private HttpStatus status;
}
