package com.expensetracker.service;

import com.expensetracker.exception.ApiException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetPredictionService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final GroqClientService groqClientService;

    public BudgetPredictionService(ExpenseRepository expenseRepository,
                                    UserRepository userRepository,
                                    GroqClientService groqClientService) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.groqClientService = groqClientService;
    }

    public Map<String, Object> predict(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        LocalDate start = LocalDate.now().minusMonths(3);
        List<Expense> recent = expenseRepository
                .findByUserAndExpenseDateBetweenOrderByExpenseDateDesc(user, start, LocalDate.now());

        if (recent.isEmpty()) {
            return Map.of(
                    "hasData", false,
                    "message", "Add a few expenses to unlock your AI budget prediction."
            );
        }

        Map<String, BigDecimal> byCategory = recent.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        long monthsSpan = Math.max(1, ChronoUnit.DAYS.between(start, LocalDate.now()) / 30);
        Map<String, BigDecimal> predictedNextMonth = new LinkedHashMap<>();
        BigDecimal predictedTotal = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> entry : byCategory.entrySet()) {
            BigDecimal monthlyAvg = entry.getValue().divide(BigDecimal.valueOf(monthsSpan), 2, RoundingMode.HALF_UP);
            predictedNextMonth.put(entry.getKey(), monthlyAvg);
            predictedTotal = predictedTotal.add(monthlyAvg);
        }

        String insight = buildAiInsight(user, byCategory, predictedTotal, predictedNextMonth);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hasData", true);
        result.put("predictedNextMonthTotal", predictedTotal);
        result.put("predictedByCategory", predictedNextMonth);
        result.put("monthlyIncome", user.getMonthlyIncome());
        result.put("insight", insight);
        return result;
    }

    private String buildAiInsight(User user, Map<String, BigDecimal> byCategory,
                                   BigDecimal predictedTotal, Map<String, BigDecimal> predictedNextMonth) {

        String topCategory = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("OTHER");

        String systemPrompt = "You are a concise, encouraging personal finance assistant embedded in a budgeting app. "
                + "Given a user's spending history, respond with 3-4 short sentences: summarize their spending pattern, "
                + "flag the category driving the most spend, and give one concrete, actionable tip to reduce next month's "
                + "budget. Do not use markdown, headers, or bullet points. Keep it under 80 words.";

        String userPrompt = String.format(
                "Monthly income: %s. Spending by category over the last 3 months: %s. " +
                "Projected next month total based on trend: %s. Top spending category: %s.",
                user.getMonthlyIncome() == null ? "not provided" : user.getMonthlyIncome().toString(),
                byCategory, predictedTotal, topCategory
        );

        String aiResponse = groqClientService.chat(systemPrompt, userPrompt);
        if (aiResponse != null && !aiResponse.isBlank()) {
            return aiResponse.trim();
        }

        // Heuristic fallback when no Groq API key is configured
        BigDecimal topAmount = predictedNextMonth.getOrDefault(topCategory, BigDecimal.ZERO);
        return String.format(
                "Based on your last few months, your spending is trending toward roughly %s next month, " +
                "with %s as your biggest category at about %s. Consider setting a soft cap on %s and " +
                "reviewing recurring charges there first — small trims in your top category tend to move " +
                "your total budget the most.",
                predictedTotal, formatCategory(topCategory), topAmount, formatCategory(topCategory)
        );
    }

    private String formatCategory(String category) {
        return category.replace("_", " ").toLowerCase();
    }
}
