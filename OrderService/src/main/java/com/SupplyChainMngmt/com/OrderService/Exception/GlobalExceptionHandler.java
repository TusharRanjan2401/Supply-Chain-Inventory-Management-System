package com.SupplyChainMngmt.com.OrderService.Exception;

import com.SupplyChainMngmt.com.OrderService.Exception.payload.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> ResourceNotFoundExceptionHandler(ResourceNotFoundException exception){
        String message = exception.getMessage();
        ApiResponse response = ApiResponse.builder().message(message).status(HttpStatus.NOT_FOUND).build();
        return new ResponseEntity<>(response,HttpStatus.NOT_FOUND);
    }
}
