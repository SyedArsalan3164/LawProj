package com.networking.service;

import com.networking.model.Interaction;
import com.networking.model.Interaction.InteractionType;
import com.networking.model.Student;
import com.networking.model.JobRole;
import com.networking.dto.StudentMatchResult;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * AI Engine — analyses student fit based on:
 *  1. Skill overlap with the job role
 *  2. Resume text (extracted from uploaded PDF)
 *  3. Chat message quality & depth
 *  4. Interaction volume & employee recommendations
 *
 * Score breakdown:
 *   Skill Match        40%
 *   Resume Analysis    30%
 *   Chat Quality       20%
 *   Recommendations    10%
 */
@Service
public class AIService {

    // ─── Weighted keyword banks ─────────────────────────────────────────────

    private static final Map<String, Integer> RESUME_SIGNALS = new LinkedHashMap<>();
    static {
        // Leadership
        RESUME_SIGNALS.put("led",        3); RESUME_SIGNALS.put("managed",      3);
        RESUME_SIGNALS.put("founded",    3); RESUME_SIGNALS.put("headed",       3);
        RESUME_SIGNALS.put("captain",    2); RESUME_SIGNALS.put("president",    2);
        RESUME_SIGNALS.put("director",   2); RESUME_SIGNALS.put("oversaw",      2);
        // Achievements
        RESUME_SIGNALS.put("award",      3); RESUME_SIGNALS.put("won",          3);
        RESUME_SIGNALS.put("first",      2); RESUME_SIGNALS.put("honor",        2);
        RESUME_SIGNALS.put("ranked",     2); RESUME_SIGNALS.put("distinction",  3);
        RESUME_SIGNALS.put("scholarship",3);
        // Technical
        RESUME_SIGNALS.put("developed",  2); RESUME_SIGNALS.put("built",        2);
        RESUME_SIGNALS.put("implemented",2); RESUME_SIGNALS.put("designed",     2);
        RESUME_SIGNALS.put("automated",  2); RESUME_SIGNALS.put("deployed",     2);
        RESUME_SIGNALS.put("algorithm",  3); RESUME_SIGNALS.put("architecture", 3);
        RESUME_SIGNALS.put("api",        2); RESUME_SIGNALS.put("database",     2);
        // Research / law / business
        RESUME_SIGNALS.put("published",  3); RESUME_SIGNALS.put("research",     2);
        RESUME_SIGNALS.put("thesis",     2); RESUME_SIGNALS.put("analysed",     2);
        RESUME_SIGNALS.put("negotiated", 2); RESUME_SIGNALS.put("drafted",      2);
        RESUME_SIGNALS.put("compliance", 2); RESUME_SIGNALS.put("regulatory",   2);
        // Soft skills
        RESUME_SIGNALS.put("collaborated",2); RESUME_SIGNALS.put("mentored",   2);
        RESUME_SIGNALS.put("communicated",2); RESUME_SIGNALS.put("facilitated", 2);
    }

    private static final Map<String, Integer> CHAT_SIGNALS = new LinkedHashMap<>();
    static {
        // Curiosity & depth
        CHAT_SIGNALS.put("how",      1); CHAT_SIGNALS.put("why",       1);
        CHAT_SIGNALS.put("could you",2); CHAT_SIGNALS.put("explain",   2);
        CHAT_SIGNALS.put("curious",  2); CHAT_SIGNALS.put("learn",     2);
        CHAT_SIGNALS.put("understand",2);
        // Professionalism
        CHAT_SIGNALS.put("thank",    2); CHAT_SIGNALS.put("appreciate",2);
        CHAT_SIGNALS.put("please",   1); CHAT_SIGNALS.put("looking forward",2);
        // Ambition
        CHAT_SIGNALS.put("goal",     2); CHAT_SIGNALS.put("aspire",    2);
        CHAT_SIGNALS.put("achieve",  2); CHAT_SIGNALS.put("improve",   1);
        CHAT_SIGNALS.put("grow",     1);
        // Leadership in chat
        CHAT_SIGNALS.put("team",     2); CHAT_SIGNALS.put("project",   2);
        CHAT_SIGNALS.put("lead",     2); CHAT_SIGNALS.put("organise",  2);
    }

    // ─── Main entry point ────────────────────────────────────────────────────

    public StudentMatchResult analyzeStudentFit(Student student, JobRole role, List<Interaction> interactions) {

        /* 1. Skill Match (0-1) */
        double skillScore = calculateSkillMatch(student.getSkills(), role.getRequiredSkills());

        /* 2. Resume Score (0-1) */
        double resumeScore = analyzeResumeText(student.getResumeText());

        /* 3. Chat Quality (0-1) */
        String chatText = extractChatText(interactions);
        double chatScore = analyzeChatQuality(chatText, interactions.size());

        /* 4. Recommendation bonus (0-1) */
        double recommendationScore = interactions.stream()
                .anyMatch(i -> i.getType() == InteractionType.FEEDBACK) ? 1.0 : 0.0;

        /* Weighted total */
        double total = (skillScore * 0.40)
                     + (resumeScore * 0.30)
                     + (chatScore   * 0.20)
                     + (recommendationScore * 0.10);

        // Clamp to [0,100]
        double matchPct = Math.min(total * 100.0, 100.0);

        List<String> capabilities = buildCapabilityProfile(student, chatText, interactions, resumeScore, skillScore);
        String reasoning = buildReasoning(student, role, matchPct, skillScore, resumeScore, chatScore, recommendationScore > 0, capabilities);

        return StudentMatchResult.builder()
                .studentId(student.getId())
                .studentName(student.getName())
                .matchPercentage(matchPct)
                .identifiedCapabilities(capabilities)
                .aiReasoning(reasoning)
                .build();
    }

    // ─── Resume Analysis ─────────────────────────────────────────────────────

    private double analyzeResumeText(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) return 0.1; // No resume → low base
        String lower = resumeText.toLowerCase();

        int score = 0;
        int maxPossible = RESUME_SIGNALS.values().stream().mapToInt(v -> v).sum();

        for (Map.Entry<String, Integer> entry : RESUME_SIGNALS.entrySet()) {
            if (lower.contains(entry.getKey())) score += entry.getValue();
        }

        // Word-count bonus (longer resume = more detail)
        int wordCount = lower.split("\\s+").length;
        if (wordCount > 300) score += 4;
        else if (wordCount > 150) score += 2;
        else if (wordCount > 80)  score += 1;

        return Math.min((double) score / (maxPossible * 0.4), 1.0);
    }

    // ─── Chat Quality ────────────────────────────────────────────────────────

    private double analyzeChatQuality(String chatText, int totalInteractions) {
        if (chatText.isBlank()) return totalInteractions > 0 ? 0.25 : 0.0;

        String lower = chatText.toLowerCase();
        int score = 0;
        int maxPossible = CHAT_SIGNALS.values().stream().mapToInt(v -> v).sum();

        for (Map.Entry<String, Integer> entry : CHAT_SIGNALS.entrySet()) {
            if (lower.contains(entry.getKey())) score += entry.getValue();
        }

        // Volume bonus
        if (totalInteractions >= 10) score += 4;
        else if (totalInteractions >= 5) score += 2;
        else if (totalInteractions >= 2) score += 1;

        // Response length signals depth
        int wordCount = lower.split("\\s+").length;
        if (wordCount > 200) score += 3;
        else if (wordCount > 80) score += 2;

        return Math.min((double) score / (maxPossible * 0.5), 1.0);
    }

    // ─── Skill overlap ───────────────────────────────────────────────────────

    private double calculateSkillMatch(List<String> studentSkills, List<String> requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) return 0.5;
        if (studentSkills   == null || studentSkills.isEmpty())  return 0.0;

        Set<String> studentSet = studentSkills.stream()
                .map(String::toLowerCase).collect(Collectors.toSet());

        long matches = requiredSkills.stream()
                .filter(s -> studentSet.contains(s.toLowerCase()))
                .count();

        return (double) matches / requiredSkills.size();
    }

    // ─── Capability profile ──────────────────────────────────────────────────

    private List<String> buildCapabilityProfile(
            Student student, String chatText, List<Interaction> interactions,
            double resumeScore, double skillScore) {

        List<String> caps = new ArrayList<>();
        String resumeLower = student.getResumeText() != null ? student.getResumeText().toLowerCase() : "";
        String chatLower   = chatText.toLowerCase();

        // Leadership
        if (resumeLower.contains("led") || resumeLower.contains("managed") || resumeLower.contains("captain")
                || chatLower.contains("lead") || chatLower.contains("team")) {
            caps.add("Leadership Potential");
        }
        // High achiever
        if (resumeLower.contains("award") || resumeLower.contains("won") || resumeLower.contains("scholarship")
                || resumeLower.contains("distinction")) {
            caps.add("High Achiever");
        }
        // Technical depth
        if (skillScore >= 0.5) caps.add("Strong Technical Foundation");
        if (resumeLower.contains("algorithm") || resumeLower.contains("architecture") || resumeLower.contains("deployed")) {
            caps.add("Engineering Depth");
        }
        // Curiosity
        if (chatLower.contains("curious") || chatLower.contains("why") || chatLower.contains("explain")) {
            caps.add("Inquisitive Learner");
        }
        // Communication
        if (chatLower.contains("appreciate") || chatLower.contains("thank") || chatLower.contains("looking forward")) {
            caps.add("Professionally Communicates");
        }
        // Research / analytical
        if (resumeLower.contains("research") || resumeLower.contains("published") || resumeLower.contains("thesis")) {
            caps.add("Research & Analytical Skills");
        }
        // Mentor recommended
        boolean recommended = interactions.stream().anyMatch(i -> i.getType() == InteractionType.FEEDBACK);
        if (recommended) caps.add("Mentor Recommended ⭐");

        // Strong resume
        if (resumeScore >= 0.6) caps.add("Comprehensive Resume");

        return caps;
    }

    // ─── Human-readable reasoning ─────────────────────────────────────────

    private String buildReasoning(
            Student student, JobRole role, double matchPct,
            double skillScore, double resumeScore, double chatScore,
            boolean isRecommended, List<String> capabilities) {

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("**Match Score: %.0f%%**  ", matchPct));

        // Overall assessment
        if (matchPct >= 80) {
            sb.append(String.format("%s is an **exceptional fit** for the %s role. ", student.getName(), role.getTitle()));
        } else if (matchPct >= 60) {
            sb.append(String.format("%s is a **strong candidate** for the %s role. ", student.getName(), role.getTitle()));
        } else if (matchPct >= 40) {
            sb.append(String.format("%s shows **moderate alignment** with the %s role. ", student.getName(), role.getTitle()));
        } else {
            sb.append(String.format("%s is an **early-stage candidate** for the %s role. ", student.getName(), role.getTitle()));
        }

        // Breakdown
        sb.append(String.format("Skill coverage: %.0f%% | Resume strength: %.0f%% | Chat quality: %.0f%%.",
                skillScore * 100, resumeScore * 100, chatScore * 100));

        if (isRecommended) sb.append(" Personally recommended by a mentor.");

        // Top capability
        if (!capabilities.isEmpty()) {
            sb.append(String.format(" Key strength identified: %s.", capabilities.get(0)));
        }

        // Improvement hint
        if (skillScore < 0.5) {
            sb.append(" Suggestion: Strengthen skill alignment with required technologies.");
        }
        if (resumeScore < 0.3) {
            sb.append(" Upload a detailed resume to significantly boost the AI score.");
        }
        if (chatScore < 0.3) {
            sb.append(" Engage more with mentors via chat to improve interaction quality score.");
        }

        return sb.toString();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private String extractChatText(List<Interaction> interactions) {
        return interactions.stream()
                .filter(i -> i.getType() == InteractionType.CHAT && i.getContent() != null)
                .map(Interaction::getContent)
                .collect(Collectors.joining(" "));
    }

    // ─── Company insight ─────────────────────────────────────────────────────

    public String generateInsight(String companyId, List<Interaction> interactions) {
        long applications   = interactions.stream().filter(i -> i.getType() == InteractionType.APPLY).count();
        long chats          = interactions.stream().filter(i -> i.getType() == InteractionType.CHAT).count();
        long feedback       = interactions.stream().filter(i -> i.getType() == InteractionType.FEEDBACK).count();

        if (applications == 0) {
            return "No applications yet. Tip: Students who chat more than 5 times convert at 3× the rate. Encourage engagement.";
        }
        return String.format(
            "Pipeline: %d applications | %d chat interactions | %d mentor recommendations. " +
            "AI recommends shortlisting candidates with >70%% match score first.",
            applications, chats, feedback);
    }

    // ─── Legacy compatibility ─────────────────────────────────────────────────

    public List<String> generateCapabilityProfile(Student student, List<Interaction> interactions) {
        String chatText = extractChatText(interactions);
        return buildCapabilityProfile(student, chatText, interactions, 0.5, 0.5);
    }
}
