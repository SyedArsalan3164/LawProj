package com.networking.controller;

import com.networking.model.Interaction;
import com.networking.repository.InteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    private final InteractionRepository repository;

    @GetMapping("/history")
    public List<Interaction> getChatHistory(@RequestParam String id1, @RequestParam String id2) {
        return repository.findChatHistory(id1, id2);
    }

    @PostMapping("/send")
    public Interaction sendMessage(@RequestBody Interaction interaction) {
        if (interaction.getTimestamp() == null) {
            interaction.setTimestamp(LocalDateTime.now());
        }
        interaction.setType(Interaction.InteractionType.CHAT);
        return repository.save(interaction);
    }
}
