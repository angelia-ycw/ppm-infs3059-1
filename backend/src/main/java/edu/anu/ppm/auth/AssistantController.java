package edu.anu.ppm.auth;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestController
@RequestMapping("/api/assistant")
class AssistantController {
    private final AssistantService assistant;

    AssistantController(AssistantService assistant) {
        this.assistant = assistant;
    }

    @GetMapping("/status")
    AssistantStatus status() {
        return new AssistantStatus(assistant.isEnabled());
    }

    @PostMapping("/chat")
    AssistantChatResponse chat(@RequestBody(required = false) AssistantChatRequest request) {
        return new AssistantChatResponse(assistant.reply(request));
    }
}

record AssistantStatus(boolean enabled) {}

record AssistantChatRequest(String message, List<AssistantChatTurn> history) {}

record AssistantChatTurn(String role, String content) {}

record AssistantChatResponse(String reply) {}

final class AssistantException extends RuntimeException {
    private final HttpStatus status;

    AssistantException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    HttpStatus status() {
        return status;
    }
}

@RestControllerAdvice
class AssistantErrorHandler {
    @ExceptionHandler(AssistantException.class)
    ResponseEntity<Map<String, String>> assistantError(AssistantException exception) {
        return ResponseEntity.status(exception.status()).body(Map.of("message", exception.getMessage()));
    }
}
