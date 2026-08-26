package com.animebackend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.animebackend.backend.entity.Episode;

import java.util.List;
import java.util.Optional;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long> {
    // Busca un episodio específico usando el slug del anime y el número de episodio
    Optional<Episode> findByAnimeSlugAndEpisodeNumber(String animeSlug, Integer episodeNumber);

    // Lista todos los episodios de un anime ordenados del más nuevo al más viejo
    List<Episode> findByAnimeSlugOrderByEpisodeNumberDesc(String animeSlug);

    // Agrega esta línea dentro de tu interface EpisodeRepository
    List<Episode> findTop10ByOrderByCreatedAtDesc();
}