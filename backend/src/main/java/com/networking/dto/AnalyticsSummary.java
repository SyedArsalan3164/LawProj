package com.networking.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AnalyticsSummary {
    private String companyId;
    private long totalViews;
    private long totalApplications;
    private long totalBookmarks;
    private Map<String, Long> interactionsByDate;
    private String aiInsight; // Natural language insight from Gemini
}
