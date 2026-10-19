package edu.anu.ppm.auth;

class AssistantUnavailableException extends RuntimeException {
    AssistantUnavailableException(String message) {
        super(message);
    }

    AssistantUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
