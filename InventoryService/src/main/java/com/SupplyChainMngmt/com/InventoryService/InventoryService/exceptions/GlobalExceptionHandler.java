package com.SupplyChainMngmt.com.InventoryService.InventoryService.exceptions;

import com.SupplyChainMngmt.com.InventoryService.InventoryService.exceptions.payload.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> ResourceNotFoundHandler(ResourceNotFoundException exception){
        ApiResponse response =  ApiResponse.builder()
                .message(exception.getMessage())
                .status(HttpStatus.NOT_FOUND)
                .build();

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> IllegalArgumentExceptionHandler(IllegalArgumentException exception){
        ApiResponse response = ApiResponse.builder()
                .message(exception.getMessage())
                .status(HttpStatus.BAD_REQUEST)
                .build();
        return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
    }
}
