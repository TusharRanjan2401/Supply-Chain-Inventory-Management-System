package com.SupplyChainMngmt.com.ShipmentService.ShipmentService.exception;

import com.SupplyChainMngmt.com.ShipmentService.ShipmentService.exception.payload.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> ResourceNotFoundExceptionHandler(ResourceNotFoundException exception){
        ApiResponse response = ApiResponse.builder()
                .message(exception.getMessage())
                .status(HttpStatus.NOT_FOUND)
                .build();
        return new ResponseEntity<>(response,HttpStatus.NOT_FOUND);
    }
}
