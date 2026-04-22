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
    }
}
