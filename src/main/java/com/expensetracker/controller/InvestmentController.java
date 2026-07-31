package com.expensetracker.controller;

import com.expensetracker.service.InvestmentResearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/investment")
public class InvestmentController {

    private final InvestmentResearchService investmentResearchService;

    public InvestmentController(InvestmentResearchService investmentResearchService) {
        this.investmentResearchService = investmentResearchService;
    }

    @GetMapping("/research")
    public ResponseEntity<Map<String, Object>> research(@RequestParam(required = false) String topic) {
        return ResponseEntity.ok(investmentResearchService.research(topic));
    }
}
