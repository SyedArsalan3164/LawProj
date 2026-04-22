package com.networking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderId;   // Could be Student ID or Employee ID
    private String receiverId; // Could be Student ID or Employee ID
    private String companyId;
    private String jobPostId;
    
    private String content; // Text for CHAT or FEEDBACK
    
    @Enumerated(EnumType.STRING)
    private InteractionType type; // VIEW, APPLY, BOOKMARK, CHAT, FEEDBACK

    private LocalDateTime timestamp;

    public enum InteractionType {
        VIEW, APPLY, BOOKMARK, CHAT, FEEDBACK
    }
}
