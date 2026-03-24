package com.smartfarm.api.exception;

/**
 * Exception thrown when AI service fails to process the request
 * This should result in HTTP 503 SERVICE UNAVAILABLE
 */
public class AiServiceException extends RuntimeException {
    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
