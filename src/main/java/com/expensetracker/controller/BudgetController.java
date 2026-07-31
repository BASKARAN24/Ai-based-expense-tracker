package com.expensetracker.controller;

import com.expensetracker.service.BudgetPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetPredictionService budgetPredictionService;

    public BudgetController(BudgetPredictionService budgetPredictionService) {
        this.budgetPredictionService = budgetPredictionService;
    }

    @GetMapping("/prediction")
    public ResponseEntity<Map<String, Object>> prediction(Authentication auth) {
        return ResponseEntity.ok(budgetPredictionService.predict(auth.getName()));
    }
}
