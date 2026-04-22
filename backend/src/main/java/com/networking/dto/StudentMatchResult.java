package com.networking.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class StudentMatchResult {
    private Long studentId;
    private String studentName;
    private double matchPercentage;
    private List<String> identifiedCapabilities;
    private String aiReasoning;
    private String verificationStatus;
}
