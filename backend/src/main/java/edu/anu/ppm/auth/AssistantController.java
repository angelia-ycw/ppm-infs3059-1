package edu.anu.ppm.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
class AssistantController {
    private final GeminiAssistantService assistant;
    private final AssistantRateLimiter rateLimiter;

    AssistantController(GeminiAssistantService assistant, AssistantRateLimiter rateLimiter) {
        this.assistant = assistant;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping
    ResponseEntity<?> ask(@RequestBody AssistantQuestion request) {
        if (request == null || request.question() == null || request.question().isBlank()
                || request.question().length() > 500) {
            return ResponseEntity.badRequest().body(Map.of("message", "Enter a question of up to 500 characters."));
        }
        if (!rateLimiter.tryAcquire()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "The site guide is busy. Please try again shortly."));
        }
        try {
            return ResponseEntity.ok(new AssistantAnswer(assistant.answer(request.question().trim())));
        } catch (AssistantUnavailableException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "The AI guide is unavailable.", "reasonCode", exception.reasonCode()));
        }
    }
}

record AssistantQuestion(String question) {}

record AssistantAnswer(String answer) {}
