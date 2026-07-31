package com.expensetracker.dto;

import com.expensetracker.model.Expense;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseDtos {

    public static class ExpenseRequest {
        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        @NotNull(message = "Category is required")
        private Expense.Category category;

        private String description;

        private LocalDate expenseDate;

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public Expense.Category getCategory() { return category; }
        public void setCategory(Expense.Category category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getExpenseDate() { return expenseDate; }
        public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    }

    public static class ExpenseResponse {
        private Long id;
        private BigDecimal amount;
        private Expense.Category category;
        private String description;
        private LocalDate expenseDate;

        public ExpenseResponse(Expense e) {
            this.id = e.getId();
            this.amount = e.getAmount();
            this.category = e.getCategory();
            this.description = e.getDescription();
            this.expenseDate = e.getExpenseDate();
        }

        public Long getId() { return id; }
        public BigDecimal getAmount() { return amount; }
        public Expense.Category getCategory() { return category; }
        public String getDescription() { return description; }
        public LocalDate getExpenseDate() { return expenseDate; }
    }
}
