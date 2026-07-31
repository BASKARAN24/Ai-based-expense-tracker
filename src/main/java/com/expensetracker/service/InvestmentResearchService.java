package com.expensetracker.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class InvestmentResearchService {

    private final GroqClientService groqClientService;

    public InvestmentResearchService(GroqClientService groqClientService) {
        this.groqClientService = groqClientService;
    }

    public Map<String, Object> research(String topic) {
        String cleanTopic = (topic == null || topic.isBlank()) ? "general market conditions" : topic.trim();

        String systemPrompt = "You are an investment research agent inside a personal finance app. "
                + "Summarize likely current market news and trends for the requested topic in a neutral, factual tone. "
                + "Structure the answer as 3 short labeled sections: 'Overview', 'Key drivers', and 'What to watch'. "
                + "Each section should be 1-2 sentences. Do not use markdown formatting or asterisks. "
                + "Always end with one sentence reminding the reader this is AI-generated general information, "
                + "not personalized financial advice.";

        String userPrompt = "Research topic: " + cleanTopic
                + ". Today's date: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".";

        String aiResponse = groqClientService.chat(systemPrompt, userPrompt);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("topic", cleanTopic);
        result.put("generatedAt", LocalDate.now().toString());

        if (aiResponse != null && !aiResponse.isBlank()) {
            result.put("summary", aiResponse.trim());
            result.put("source", "groq-ai");
        } else {
            result.put("summary", fallbackSummary(cleanTopic));
            result.put("source", "local-fallback");
        }

        return result;
    }

    private String fallbackSummary(String topic) {
        return "Overview: live AI market research is unavailable right now because no Groq API key is configured. "
                + "Key drivers: once configured, this agent summarizes recent trends for \"" + topic + "\" using an LLM. "
                + "What to watch: add your GROQ_API_KEY to application.properties or as an environment variable to enable "
                + "live summaries. This is general information only, not personalized financial advice.";
    }
}
