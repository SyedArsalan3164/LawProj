package com.networking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;
    private String githubUrl;
    
    @Column(columnDefinition = "TEXT")
    private String resumeText; // Extracted text from resume for AI analysis
    @ElementCollection
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "student_id"))
    private List<String> skills;
    
    @ElementCollection
    @CollectionTable(name = "student_projects", joinColumns = @JoinColumn(name = "student_id"))
    private List<Project> projects;

    @ElementCollection
    @CollectionTable(name = "student_applications", joinColumns = @JoinColumn(name = "student_id"))
    private List<String> appliedJobRoleIds; // History of roles applied for earlier

    @Column(length = 1000)
    private String aiCapabilitySummary; // AI-generated summary of capabilities

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }
}
