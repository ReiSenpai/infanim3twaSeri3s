package com.animebackend.backend.controller;

import com.animebackend.backend.entity.TelegramChannel;
import com.animebackend.backend.repository.TelegramChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/channels")
public class TelegramChannelController {

    @Autowired
    private TelegramChannelRepository channelRepository;

    @GetMapping
    public List<TelegramChannel> getAllChannels() {
        return channelRepository.findAll();
    }

    @PostMapping
    public TelegramChannel createChannel(@RequestBody TelegramChannel channel) {
        return channelRepository.save(channel);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TelegramChannel> updateChannel(@PathVariable Long id, @RequestBody TelegramChannel details) {
        return channelRepository.findById(id).map(channel -> {
            channel.setName(details.getName());
            channel.setChatId(details.getChatId());
            return ResponseEntity.ok(channelRepository.save(channel));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChannel(@PathVariable Long id) {
        return channelRepository.findById(id).map(channel -> {
            channelRepository.delete(channel);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}