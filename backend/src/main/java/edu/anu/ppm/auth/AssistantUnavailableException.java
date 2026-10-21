package edu.anu.ppm.auth;

class AssistantUnavailableException extends RuntimeException {
    private final String reasonCode;

    AssistantUnavailableException(String reasonCode, String message) {
        super(message);
        this.reasonCode = reasonCode;
    }

    AssistantUnavailableException(String reasonCode, String message, Throwable cause) {
        super(message, cause);
        this.reasonCode = reasonCode;
    }

    String reasonCode() {
        return reasonCode;
    }
}
