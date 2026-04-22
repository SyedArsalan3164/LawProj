package com.networking.service;

import com.networking.dto.AnalyticsSummary;
import com.networking.model.Interaction;
import com.networking.repository.InteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {
    private final InteractionRepository repository;
    private final AIService aiService;

    public AnalyticsSummary getCompanyAnalytics(String companyId) {
        List<Interaction> interactions = repository.findByCompanyId(companyId);

        long views = interactions.stream()
                .filter(i -> i.getType() == Interaction.InteractionType.VIEW).count();
        long applications = interactions.stream()
                .filter(i -> i.getType() == Interaction.InteractionType.APPLY).count();
        long bookmarks = interactions.stream()
                .filter(i -> i.getType() == Interaction.InteractionType.BOOKMARK).count();

        Map<String, Long> byDate = interactions.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getTimestamp().toLocalDate().toString(),
                        Collectors.counting()
                ));

        String insight = aiService.generateInsight(companyId, interactions);

        return AnalyticsSummary.builder()
                .companyId(companyId)
                .totalViews(views)
                .totalApplications(applications)
                .totalBookmarks(bookmarks)
                .interactionsByDate(byDate)
                .aiInsight(insight) 
                .build();
    }
    
    public void recordInteraction(Interaction interaction) {
        repository.save(interaction);
    }
}
