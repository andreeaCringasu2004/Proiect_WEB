package com.artpulse.controller;

import com.artpulse.entity.Message;
import com.artpulse.entity.Product;
import com.artpulse.entity.User;
import com.artpulse.repository.MessageRepository;
import com.artpulse.repository.ProductRepository;
import com.artpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<FrontendMessageDTO> getAllMessages() {
        return messageRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public FrontendMessageDTO createMessage(@RequestBody FrontendMessageDTO dto) {
        Message message = new Message();
        
        User sender = dto.getFromId() != null ? userRepository.findById(dto.getFromId()).orElse(null) : null;
        User receiver = (dto.getToId() != null && dto.getToId() != 0) ? userRepository.findById(dto.getToId()).orElse(null) : null;
        Product product = (dto.getProductId() != null && dto.getProductId() != -1) ? productRepository.findById(dto.getProductId()).orElse(null) : null;

        message.setSender(sender);
        message.setReceiver(receiver);
        message.setProductContext(product);
        message.setContent(dto.getText());
        message.setIsAppointmentProposal(false);
        message.setIsDeleted(dto.getIsDeleted() != null ? dto.getIsDeleted() : false);
        if (dto.getDocuments() != null) {
            message.setDocuments(dto.getDocuments());
        }

        Message saved = messageRepository.save(message);
        return toDTO(saved);
    }

    @PutMapping("/{id}")
    public FrontendMessageDTO updateMessage(@PathVariable Long id, @RequestBody FrontendMessageDTO dto) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        if (dto.getIsDeleted() != null) {
            message.setIsDeleted(dto.getIsDeleted());
        }
        if (dto.getText() != null) {
            message.setContent(dto.getText());
        }
        Message saved = messageRepository.save(message);
        return toDTO(saved);
    }

    private FrontendMessageDTO toDTO(Message m) {
        FrontendMessageDTO dto = new FrontendMessageDTO();
        dto.setId(m.getId());
        dto.setProductId(m.getProductContext() != null ? m.getProductContext().getId() : -1L);
        dto.setFromId(m.getSender() != null ? m.getSender().getId() : null);
        dto.setToId(m.getReceiver() != null ? m.getReceiver().getId() : 0L);
        dto.setText(m.getContent());
        dto.setTime(formatSentAt(m.getSentAt()));
        dto.setDocuments(m.getDocuments());
        dto.setIsDeleted(m.getIsDeleted() != null ? m.getIsDeleted() : false);
        return dto;
    }

    private String formatSentAt(LocalDateTime sentAt) {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
        LocalDateTime now = LocalDateTime.now();
        if (sentAt.toLocalDate().isEqual(now.toLocalDate())) {
            return sentAt.format(DateTimeFormatter.ofPattern("HH:mm"));
        } else {
            return sentAt.format(DateTimeFormatter.ofPattern("dd.MM HH:mm"));
        }
    }

    public static class FrontendMessageDTO {
        private Long id;
        private Long productId;
        private Long fromId;
        private Long toId;
        private String text;
        private String time;
        private Boolean isDeleted = false;

        private List<String> documents;
 
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Long getFromId() { return fromId; }
        public void setFromId(Long fromId) { this.fromId = fromId; }
        public Long getToId() { return toId; }
        public void setToId(Long toId) { this.toId = toId; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public List<String> getDocuments() { return documents; }
        public void setDocuments(List<String> documents) { this.documents = documents; }
        public Boolean getIsDeleted() { return isDeleted; }
        public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    }
}
