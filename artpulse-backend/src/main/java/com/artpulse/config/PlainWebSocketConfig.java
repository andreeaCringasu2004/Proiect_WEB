package com.artpulse.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Configuration
@EnableWebSocket
public class PlainWebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new PlainWebSocketHandler(), "/")
                .setAllowedOrigins("*");
    }

    private static class PlainWebSocketHandler extends TextWebSocketHandler {
        private static final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            sessions.add(session);
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            String payload = message.getPayload();
            // Broadcast to all other sessions
            for (WebSocketSession s : sessions) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    try {
                        s.sendMessage(new TextMessage(payload));
                    } catch (IOException e) {
                        sessions.remove(s);
                    }
                }
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
            sessions.remove(session);
        }
    }
}
