package com.animebackend.backend.repository;

import com.animebackend.backend.entity.TelegramChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelegramChannelRepository extends JpaRepository<TelegramChannel, Long> {
}