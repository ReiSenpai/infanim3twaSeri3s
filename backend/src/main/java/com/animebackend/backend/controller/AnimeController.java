package com.animebackend.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.animebackend.backend.dto.EpisodeDto;
import com.animebackend.backend.dto.RecentEpisodeDto;
import com.animebackend.backend.service.AnimeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/animes")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*") // Aseguramos que Next.js pueda acceder
public class AnimeController {
    private final AnimeService animeService;

    /**
     * Endpoint para obtener un episodio específico.
     */
    @GetMapping("/{slug}/episodes/{episodeNumber}")
    public ResponseEntity<?> getEpisode(
            @PathVariable String slug,
            @PathVariable Integer episodeNumber) {

        try {
            EpisodeDto episodeData = animeService.getEpisodeData(slug, episodeNumber);
            return ResponseEntity.ok(episodeData);
        } catch (RuntimeException e) {
            // 👇 MEJORA: Devolvemos un JSON en lugar de un cuerpo vacío
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Episodio no encontrado en la base de datos");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Endpoint para obtener los últimos episodios agregados (Catálogo Home)
     */
    @GetMapping("/recent-episodes")
    public ResponseEntity<List<RecentEpisodeDto>> getRecentEpisodes() {
        return ResponseEntity.ok(animeService.getRecentEpisodes());
    }
}