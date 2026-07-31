package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseDtos.*;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> list(Authentication auth) {
        return ResponseEntity.ok(expenseService.listExpenses(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(Authentication auth, @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.addExpense(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(Authentication auth, @PathVariable Long id,
                                                   @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(Authentication auth, @PathVariable Long id) {
        expenseService.deleteExpense(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Expense deleted"));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(Authentication auth) {
        return ResponseEntity.ok(expenseService.summary(auth.getName()));
    }
}
