package com.networking.controller;

import com.networking.model.Interaction;
import com.networking.repository.InteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class WSChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final InteractionRepository repository;
    private final com.networking.repository.StudentRepository studentRepository;
    private final com.networking.repository.EmployeeRepository employeeRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Interaction interaction) {
        System.out.println("Received WS Message: " + interaction.getContent() + " from " + interaction.getSenderId() + " to " + interaction.getReceiverId());
        interaction.setTimestamp(LocalDateTime.now());
        interaction.setType(Interaction.InteractionType.CHAT);
        repository.save(interaction);
        
        // Broadcast to a topic specific to the conversation (receiver)
        messagingTemplate.convertAndSend("/topic/messages/" + interaction.getReceiverId(), interaction);
        // Also send back to sender so they see it in their UI
        messagingTemplate.convertAndSend("/topic/messages/" + interaction.getSenderId(), interaction);

        // NEW: Broadcast to company activity feed with names
        if (interaction.getCompanyId() != null) {
            String studentName = "Unknown Student";
            String employeeName = "Unknown Employee";
            try {
                if (interaction.getSenderId().startsWith("STUDENT_")) {
                    Long sid = Long.parseLong(interaction.getSenderId().replace("STUDENT_", ""));
                    studentName = studentRepository.findById(sid).map(s -> s.getName()).orElse(studentName);
                } else if (interaction.getReceiverId().startsWith("STUDENT_")) {
                    Long sid = Long.parseLong(interaction.getReceiverId().replace("STUDENT_", ""));
                    studentName = studentRepository.findById(sid).map(s -> s.getName()).orElse(studentName);
                }

                if (interaction.getSenderId().startsWith("EMPLOYEE_")) {
                    Long eid = Long.parseLong(interaction.getSenderId().replace("EMPLOYEE_", ""));
                    employeeName = employeeRepository.findById(eid).map(e -> e.getName()).orElse(employeeName);
                } else if (interaction.getReceiverId().startsWith("EMPLOYEE_")) {
                    Long eid = Long.parseLong(interaction.getReceiverId().replace("EMPLOYEE_", ""));
                    employeeName = employeeRepository.findById(eid).map(e -> e.getName()).orElse(employeeName);
                }
            } catch (Exception e) {}

            com.networking.dto.InteractionActivity activity = com.networking.dto.InteractionActivity.builder()
                    .interaction(interaction)
                    .studentName(studentName)
                    .employeeName(employeeName)
                    .build();
            messagingTemplate.convertAndSend("/topic/company/" + interaction.getCompanyId() + "/activity", activity);
        }
    }
}
