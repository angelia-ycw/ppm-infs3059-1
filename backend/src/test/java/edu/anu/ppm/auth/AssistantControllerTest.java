package edu.anu.ppm.auth;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AssistantControllerTest {
    private GeminiAssistantService assistant;
    private MockMvc http;

    @BeforeEach
    void setUp() {
        assistant = mock(GeminiAssistantService.class);
        http = MockMvcBuilders.standaloneSetup(new AssistantController(assistant, new AssistantRateLimiter())).build();
    }

    @Test
    void sendsOnlyTheQuestionAndReturnsTheSiteSpecificAnswer() throws Exception {
        when(assistant.answer("What should I do during planning?"))
                .thenReturn("Set objectives, budget, and staff capacity in Investment Context.");

        http.perform(post("/api/assistant")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"What should I do during planning?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value(
                        "Set objectives, budget, and staff capacity in Investment Context."));
    }

    @Test
    void rejectsEmptyAndOverlongQuestions() throws Exception {
        http.perform(post("/api/assistant")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"   \"}"))
                .andExpect(status().isBadRequest());

        String tooLong = "x".repeat(501);
        String json = "{\"question\":\"" + tooLong + "\"}";
        http.perform(post("/api/assistant").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsServiceUnavailableSoTheBrowserCanUseOfflineGuide() throws Exception {
        when(assistant.answer(anyString())).thenThrow(new AssistantUnavailableException("Gemini unavailable."));

        http.perform(post("/api/assistant")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"How does comparison work?\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("The AI guide is unavailable."));
    }
}
