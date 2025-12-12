package com.SupplyChainMngmt.com.InventoryService.InventoryService.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sku", nullable = false)
    private String sku;

    @Column(name = "warehouse_id", nullable = false)
    private String warehouseId;

    @Column(name = "available_qty", nullable = false)
    private Integer availableQty;

    @Column(name = "reserved_qty", nullable = false)
    private Integer reservedQty = 0;

    @Column(name = "incoming_qty", nullable = false)
    private Integer incomingQty = 0;

    @Column(name = "threshold", nullable = false)
    private Integer threshold = 0;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
