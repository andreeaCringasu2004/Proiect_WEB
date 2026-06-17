package com.artpulse.controller;

import com.artpulse.dto.ChatMessageDTO;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatController {

    // Frontend trimite un mesaj la /app/chat/{productId}
    // Controller-ul il preia si il trimite mai departe la /topic/messages/{productId}
    @MessageMapping("/chat/{productId}")
    @SendTo("/topic/messages/{productId}")
    public ChatMessageDTO sendMessage(@DestinationVariable Long productId, @Payload ChatMessageDTO chatMessage) {
        // Optional: Aici poti salva mesajul in baza de date in tabelul "messages" 
        // folosind un MessageRepository
        
        // Asiguram consistenta
        chatMessage.setProductId(productId);
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(Instant.now().toString());
        }
        
        return chatMessage;
    }
}
