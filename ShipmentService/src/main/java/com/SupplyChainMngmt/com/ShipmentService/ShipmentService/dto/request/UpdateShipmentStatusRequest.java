package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.dto.request;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.entities.type.ShipmentStatus;
import lombok.Data;

@Data
public class UpdateShipmentStatusRequest {
    private ShipmentStatus status;
}
