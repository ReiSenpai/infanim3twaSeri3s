package com.animebackend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.animebackend.backend.entity.Anime;

import java.util.Optional;

@Repository
public interface AnimeRepository extends JpaRepository<Anime, Long> {
    Optional<Anime> findBySlug(String slug);
}