package com.smartfarm.api.exception;

/**
 * Exception thrown when a requested resource is not found
 * This should result in HTTP 404 NOT FOUND
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object id) {
        super(String.format("%s not found with id: %s", resourceName, id));
    }
}
