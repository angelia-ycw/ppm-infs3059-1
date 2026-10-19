package edu.anu.ppm.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class AssistantServiceTest {
    @Test
    void extractsEveryAssistantTextPartAndIgnoresNonMessageOutput() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        AssistantService service = new AssistantService(mapper, "", "gpt-6-luna");
        String response = """
                {
                  "output": [
                    {"type": "reasoning", "summary": []},
                    {"type": "message", "content": [
                      {"type": "output_text", "text": "First part."},
                      {"type": "refusal", "refusal": "Not relevant."},
                      {"type": "output_text", "text": "Second part."}
                    ]}
                  ]
                }
                """;

        assertThat(service.extractText(mapper.readTree(response))).isEqualTo("First part.\nSecond part.");
    }
}
