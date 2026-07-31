package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDtos.*;
import com.expensetracker.exception.ApiException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    public List<ExpenseResponse> listExpenses(String email) {
        User user = currentUser(email);
        return expenseRepository.findByUserOrderByExpenseDateDesc(user)
                .stream().map(ExpenseResponse::new).collect(Collectors.toList());
    }

    public ExpenseResponse addExpense(String email, ExpenseRequest request) {
        User user = currentUser(email);
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now());
        return new ExpenseResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(String email, Long id, ExpenseRequest request) {
        User user = currentUser(email);
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ApiException("Expense not found", HttpStatus.NOT_FOUND));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this expense", HttpStatus.FORBIDDEN);
        }

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }
        return new ExpenseResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(String email, Long id) {
        User user = currentUser(email);
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ApiException("Expense not found", HttpStatus.NOT_FOUND));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this expense", HttpStatus.FORBIDDEN);
        }
        expenseRepository.delete(expense);
    }

    public Map<String, Object> summary(String email) {
        User user = currentUser(email);
        List<Expense> expenses = expenseRepository.findByUserOrderByExpenseDateDesc(user);

        BigDecimal total = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        BigDecimal thisMonthTotal = expenses.stream()
                .filter(e -> !e.getExpenseDate().isBefore(startOfMonth))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalSpent", total,
                "thisMonthSpent", thisMonthTotal,
                "byCategory", byCategory,
                "transactionCount", expenses.size()
        );
    }
}
