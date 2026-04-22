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
    private final com.networking.repository.StudentRepository studentRepository;
    private final com.networking.repository.EmployeeRepository employeeRepository;

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
    

    public List<com.networking.dto.InteractionActivity> getRecentStudentInteractions(String companyId) {
        return repository.findTop10ByCompanyIdOrderByTimestampDesc(companyId).stream()
                .map(i -> {
                    String studentName = "Unknown Student";
                    String employeeName = "Unknown Employee";

                    try {
                        if (i.getSenderId().startsWith("STUDENT_")) {
                            Long sid = Long.parseLong(i.getSenderId().replace("STUDENT_", ""));
                            studentName = studentRepository.findById(sid).map(s -> s.getName()).orElse(studentName);
                        } else if (i.getReceiverId().startsWith("STUDENT_")) {
                            Long sid = Long.parseLong(i.getReceiverId().replace("STUDENT_", ""));
                            studentName = studentRepository.findById(sid).map(s -> s.getName()).orElse(studentName);
                        }

                        if (i.getSenderId().startsWith("EMPLOYEE_")) {
                            Long eid = Long.parseLong(i.getSenderId().replace("EMPLOYEE_", ""));
                            employeeName = employeeRepository.findById(eid).map(e -> e.getName()).orElse(employeeName);
                        } else if (i.getReceiverId().startsWith("EMPLOYEE_")) {
                            Long eid = Long.parseLong(i.getReceiverId().replace("EMPLOYEE_", ""));
                            employeeName = employeeRepository.findById(eid).map(e -> e.getName()).orElse(employeeName);
                        }
                    } catch (Exception e) {
                        // Ignore parsing errors
                    }

                    return com.networking.dto.InteractionActivity.builder()
                            .interaction(i)
                            .studentName(studentName)
                            .employeeName(employeeName)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    public void recordInteraction(Interaction interaction) {
        repository.save(interaction);
    }
}
