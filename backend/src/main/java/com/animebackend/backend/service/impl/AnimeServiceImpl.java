package com.animebackend.backend.service.impl;

import com.animebackend.backend.dto.EpisodeDto;
import com.animebackend.backend.dto.RecentEpisodeDto;
import com.animebackend.backend.entity.Anime;
import com.animebackend.backend.entity.Episode;
import com.animebackend.backend.repository.AnimeRepository;
import com.animebackend.backend.repository.EpisodeRepository;
import com.animebackend.backend.service.AnimeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Esto le dice a Spring que inyecte animeRepository y episodeRepository automáticamente
@Slf4j
public class AnimeServiceImpl implements AnimeService {

    private final AnimeRepository animeRepository;
    private final EpisodeRepository episodeRepository;

    @Override
    @Transactional
    public EpisodeDto getEpisodeData(String animeSlug, Integer episodeNumber) {
        // 1. Buscamos el episodio en la base de datos
        Episode episode = episodeRepository.findByAnimeSlugAndEpisodeNumber(animeSlug, episodeNumber)
                .orElseThrow(() -> new RuntimeException("Episodio no encontrado"));

        // 2. Verificamos si ya tenemos el enlace directo extraído previamente
        String cleanVideoUrl = episode.getDirectMp4Url();

        // 3. Si no existe, hacemos el scraping en tiempo real
        if (cleanVideoUrl == null || cleanVideoUrl.isEmpty()) {
            cleanVideoUrl = extractMp4DirectLink(episode.getSourceUrl());

            // Si el scraping fue exitoso, guardamos el link en BD para no volver a extraerlo
            if (!cleanVideoUrl.equals(episode.getSourceUrl())) {
                episode.setDirectMp4Url(cleanVideoUrl);
                episodeRepository.save(episode);
            }
        }

        // 4. Mapeamos a DTO y respondemos
        return EpisodeDto.builder()
                .animeTitle(episode.getAnime().getTitle())
                .episodeNumber(episode.getEpisodeNumber())
                .episodeTitle(episode.getTitle())
                .synopsis(episode.getAnime().getSynopsis())
                .videoUrl(cleanVideoUrl)
                .build();
    }

    /**
     * Lógica de Scraping con Jsoup para obtener el MP4 directo.
     */
    private String extractMp4DirectLink(String sourceUrl) {
        try {
            log.info("Iniciando extracción de video desde: {}", sourceUrl);

            // Nos conectamos a la URL camuflando la petición como un navegador real
            Document doc = Jsoup.connect(sourceUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            Element videoElement = doc.selectFirst("video");

            if (videoElement != null && videoElement.hasAttr("src")) {
                String mp4Url = videoElement.attr("src");
                log.info("Video extraído exitosamente: {}", mp4Url);
                return mp4Url;
            }

            log.warn("No se encontró la etiqueta <video> directamente.");
            return sourceUrl;

        } catch (Exception e) {
            log.error("Error al extraer el video de {}: {}", sourceUrl, e.getMessage());
            return sourceUrl;
        }
    }

    @Override
    public List<RecentEpisodeDto> getRecentEpisodes() {
        // 1. Obtenemos los episodios desde MySQL
        List<Episode> episodes = episodeRepository.findAll();

        // 2. Mapeamos la entidad "Episode" al DTO que espera Next.js
        return episodes.stream().map(episode -> RecentEpisodeDto.builder()
                .animeSlug(episode.getAnime().getSlug())
                .episodeNumber(episode.getEpisodeNumber())
                .animeTitle(episode.getAnime().getTitle())
                .episodeTitle(episode.getTitle())
                .coverUrl(episode.getAnime().getCoverUrl())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<Anime> obtenerTodos() {
        return animeRepository.findAll();
    }
}