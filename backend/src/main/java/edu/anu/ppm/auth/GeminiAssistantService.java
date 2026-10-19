package edu.anu.ppm.auth;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.ResourceAccessException;
import tools.jackson.databind.JsonNode;

import java.net.http.HttpClient;

@Service
class GeminiAssistantService {
    private static final int MAX_ATTEMPTS = 2;
    private static final String SITE_GUIDE = """
            You are the help assistant for this specific Project Portfolio Management (PPM) prototype.
            Answer the user's question using only the site guide below. Be concise, friendly, and practical.
            Match the language used by the user. Give steps when they ask what to do.
            Do not answer with a generic dictionary definition when they ask what a screen or feature means here.
            If a question is unrelated to this PPM website, briefly say you can only help with this site's screens and workflow.
            Never invent a button, page, setting, stored value, or capability. If the guide does not establish an answer,
            say that you cannot confirm it from the prototype and suggest asking the team. Distinguish a sample/demo
            experience from the signed-in workplace. Do not claim to see the user's current screen or saved project data.
            Do not ask for or repeat passwords, API keys, or personal information. Do not request confidential project
            details; if the user includes them, do not echo them and keep the reply to general site guidance.

            SITE GUIDE (the product context to use when answering):
            - This prototype supports an IT project portfolio workflow with three roles.
            - Project Proposer submits project information and supporting evidence.
            - Reviewer evaluates each submitted project against five separate criteria and records a brief rationale
              for every rating: Strategic Alignment, Expected Business Value, Delivery Feasibility, Risk Manageability,
              and Time Criticality. For Risk Manageability, a higher rating means the risk is easier to manage/lower.
            - Portfolio Manager sets the investment context (planning cycle, objectives, total budget and available
              staff capacity), then reviews projects, compares and shortlists them, builds a candidate portfolio,
              checks aggregate cost/staff against the context, reviews the portfolio, and records a human decision.
            - The comparison screen shows the five-criterion radar profile. It can display one selected evaluated
              project and overlay two to four selected projects. It visualizes the individual ratings; it does not
              produce a ranking or determine a winner.
            - A shortlist is a temporary set for further consideration, not an approval. A candidate portfolio is
              checked against budget and staff limits. Passing those checks is not approval.
            - The final approve/defer/reject decision is recorded by a human Portfolio Manager, with a reason.
            - This prototype does not calculate a weighted or overall score, ROI/financial return, automatic ranking,
              or automated approval/rejection. Do not imply that it does.
            - The read-only demo uses example data and does not save changes. The signed-in workplace is separate.
              Explain only functions established in this guide; if unsure about the currently deployed state, say so.
            - The Java account API and PostgreSQL database provide sign-in and per-account workplace storage. The same
              account can access its saved workspace on another device when the API and database are available.
              The role setting filters the prototype's visible workflow; it is not a security/permission boundary.
            - Visitors can inspect the demo without signing in. Live Demo is an optional walkthrough and does not
              automatically start. Account settings allow a signed-in person to update profile details or delete their
              account and associated workspace.
            - The small contextual i help is for instructions about a screen area; the optional Live Demo is a general
              walkthrough. Neither should be described as an AI evaluation of a user's project.
            - The backend sends these fixed site instructions and the user's current typed question. It does not send
              chat history, proposal records, or saved workplace data. The user may still type sensitive text, so
              remind them not to do so if relevant.
            """;

    private final String apiKey;
    private final String model;
    private final RestClient restClient;

    GeminiAssistantService(@Value("${ppm.assistant.api-key:}") String apiKey,
            @Value("${ppm.assistant.model:gemini-3.5-flash-lite}") String model) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        // Flash Lite is usually quick, but avoid timing out healthy responses during load.
        requestFactory.setReadTimeout(Duration.ofSeconds(30));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    String answer(String question) {
        if (apiKey.isBlank()) throw new AssistantUnavailableException("Gemini is not configured.");
        try {
            Map<String, Object> payload = Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", SITE_GUIDE))),
                    "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", question)))),
                    "generationConfig", Map.of("temperature", 0.2, "maxOutputTokens", 400));
            JsonNode response = generateContentWithRetry(payload);
            JsonNode parts = response == null ? null : response.path("candidates").path(0).path("content").path("parts");
            if (parts != null && parts.isArray()) {
                StringBuilder answer = new StringBuilder();
                for (JsonNode part : parts) {
                    String partText = part.path("text").asStringOpt().orElse(null);
                    if (partText != null) {
                        if (!answer.isEmpty()) answer.append('\n');
                        answer.append(partText);
                    }
                }
                if (!answer.isEmpty()) return answer.toString().trim();
            }
            throw new AssistantUnavailableException("Gemini returned no answer.");
        } catch (RestClientException exception) {
            throw new AssistantUnavailableException("Gemini request failed.", exception);
        }
    }

    private JsonNode generateContentWithRetry(Map<String, Object> payload) {
        RestClientException lastError = null;
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            try {
                return restClient.post()
                        .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", model)
                        .header("x-goog-api-key", apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .body(JsonNode.class);
            } catch (RestClientResponseException exception) {
                int status = exception.getStatusCode().value();
                if (status != 429 && status < 500) throw exception;
                lastError = exception;
            } catch (ResourceAccessException exception) {
                lastError = exception;
            }

            if (attempt + 1 < MAX_ATTEMPTS) waitBeforeRetry(lastError, attempt);
        }
        throw new AssistantUnavailableException("Gemini request failed after retry.", lastError);
    }

    private void waitBeforeRetry(RestClientException cause, int attempt) {
        long backoffMillis = 500L * (1L << attempt) + ThreadLocalRandom.current().nextLong(100L, 401L);
        try {
            Thread.sleep(backoffMillis);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AssistantUnavailableException("Gemini retry was interrupted.", cause);
        }
    }
}
