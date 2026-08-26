package com.animebackend.backend.service;

import java.util.List;

import com.animebackend.backend.dto.EpisodeDto;
import com.animebackend.backend.dto.RecentEpisodeDto;
import com.animebackend.backend.entity.Anime;

public interface AnimeService {
    // El nombre debe ser exactamente getEpisodeData
    EpisodeDto getEpisodeData(String animeSlug, Integer episodeNumber);

    // Agrega esto en tu interfaz AnimeService
    List<RecentEpisodeDto> getRecentEpisodes();

    List<Anime> obtenerTodos();
}