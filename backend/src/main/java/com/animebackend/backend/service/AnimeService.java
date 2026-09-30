package com.animebackend.backend.service;

import java.util.List;

import com.animebackend.backend.dto.EpisodeDto;
import com.animebackend.backend.dto.RecentEpisodeDto;
import com.animebackend.backend.entity.Anime;

public interface AnimeService {
    // El nombre debe ser exactamente getEpisodeData
    EpisodeDto getEpisodeData(String animeSlug, Integer episodeNumber);

    List<RecentEpisodeDto> getRecentEpisodes();

    List<Anime> obtenerTodos();

    // 🔥 NUEVO: Declaramos el método que guarda y notifica a Telegram
    Anime crearAnime(Anime anime);
}