package com.networking.controller;

import com.networking.dto.AnalyticsSummary;
import com.networking.model.Interaction;
import com.networking.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow any frontend origin (Vercel)
public class AnalyticsController {
    private final InteractionService service;

    @GetMapping("/company/{companyId}")
    public AnalyticsSummary getAnalytics(@PathVariable String companyId) {
        return service.getCompanyAnalytics(companyId);
    }

    @PostMapping("/record")
    public void recordInteraction(@RequestBody Interaction interaction) {
        if (interaction.getTimestamp() == null) {
            interaction.setTimestamp(LocalDateTime.now());
        }
        service.recordInteraction(interaction);
    }
}
