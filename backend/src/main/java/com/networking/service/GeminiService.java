package com.networking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateContent(String prompt) {
        if ("REPLACE_WITH_YOUR_KEY".equals(apiKey) || apiKey.isEmpty()) {
            return "{\"error\": \"Gemini API key not configured.\"}";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct Gemini request body
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, entity, String.class);
            
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }

    /**
     * Specialized method to get structured JSON from Gemini
     */
    public JsonNode getStructuredAnalysis(String prompt) {
        String rawResponse = generateContent(prompt + "\n\nReturn ONLY raw JSON. No markdown blocks, no extra text.");
        try {
            // Remove markdown code blocks if present
            String cleaned = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            // Fallback for parsing errors
            return objectMapper.createObjectNode().put("error", "Failed to parse AI response: " + e.getMessage());
        }
    }
}
