package com.animebackend.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "telegram_channels")
public class TelegramChannel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String chatId;

    // Constructores vacíos necesarios para Spring
    public TelegramChannel() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }
}