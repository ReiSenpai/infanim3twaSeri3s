package com.animebackend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.animebackend.backend.dto.NuevoEpisodioRequest;
import com.animebackend.backend.entity.Anime;
import com.animebackend.backend.entity.Episode;
import com.animebackend.backend.repository.AnimeRepository;
import com.animebackend.backend.repository.EpisodeRepository;
import com.animebackend.backend.service.TelegramNotificationService;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(originPatterns = "*")
public class AdminController {

    @Autowired
    private TelegramNotificationService telegramService;

    @Autowired
    private AnimeRepository animeRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    // ==========================================
    // GESTIÓN DE EPISODIOS
    // ==========================================
    
    @PostMapping("/episodes")
    public ResponseEntity<?> agregarEpisodio(@RequestBody NuevoEpisodioRequest request) {
        try {
            Optional<Anime> animeOpt = animeRepository.findBySlug(request.getAnimeId());
            
            if (animeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"El Anime con ID '" + request.getAnimeId() + "' no existe en la base de datos.\"}");
            }

            Anime animeReal = animeOpt.get();

            Episode nuevoEpisodio = new Episode();
            nuevoEpisodio.setAnime(animeReal);
            nuevoEpisodio.setEpisodeNumber(Integer.parseInt(request.getEpisodeNumber()));
            nuevoEpisodio.setVideoUrl(request.getVideoUrl());

            episodeRepository.save(nuevoEpisodio);

            // Pasamos los datos reales del Anime desde MySQL para evitar fallos en la URL de Telegram
            telegramService.sendNewEpisodeAlert(
                    animeReal.getTitle(),
                    request.getEpisodeNumber(),
                    animeReal.getSlug()
            );

            return ResponseEntity.ok().body("{\"message\": \"Episodio guardado en BD y notificado con éxito\"}");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/episodes")
    public ResponseEntity<?> listarTodosLosEpisodios() {
        try {
            return ResponseEntity.ok(episodeRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/episodes/{id}")
    public ResponseEntity<?> actualizarEpisodio(@PathVariable Long id, @RequestBody NuevoEpisodioRequest request) {
        try {
            Optional<Episode> epOpt = episodeRepository.findById(id);
            if (epOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Episodio no encontrado\"}");
            }
            
            Episode ep = epOpt.get();
            ep.setEpisodeNumber(Integer.parseInt(request.getEpisodeNumber()));
            ep.setVideoUrl(request.getVideoUrl());
            
            Optional<Anime> animeOpt = animeRepository.findBySlug(request.getAnimeId());
            animeOpt.ifPresent(ep::setAnime);

            episodeRepository.save(ep);
            return ResponseEntity.ok().body("{\"message\": \"Episodio actualizado correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/episodes/{id}")
    public ResponseEntity<?> eliminarEpisodio(@PathVariable Long id) {
        try {
            episodeRepository.deleteById(id);
            return ResponseEntity.ok().body("{\"message\": \"Episodio eliminado correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // ==========================================
    // GESTIÓN DE ANIMES
    // ==========================================
    
    @PostMapping("/animes")
    public ResponseEntity<?> agregarAnime(@RequestBody Anime nuevoAnime) {
        try {
            if (animeRepository.findBySlug(nuevoAnime.getSlug()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Ya existe un anime con este ID (Slug).\"}");
            }
            
            animeRepository.save(nuevoAnime);
            return ResponseEntity.ok().body("{\"message\": \"Anime registrado correctamente.\"}");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/animes")
    public ResponseEntity<?> listarTodosLosAnimes() {
        try {
            return ResponseEntity.ok(animeRepository.findAll()); 
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/animes/{id}")
    public ResponseEntity<?> actualizarAnime(@PathVariable Long id, @RequestBody Anime animeUpdate) {
        try {
            Optional<Anime> animeOpt = animeRepository.findById(id);
            if (animeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Anime no encontrado\"}");
            }
            
            Anime animeDb = animeOpt.get();
            animeDb.setSlug(animeUpdate.getSlug());
            animeDb.setTitle(animeUpdate.getTitle());
            animeDb.setCoverUrl(animeUpdate.getCoverUrl());
            animeDb.setSynopsis(animeUpdate.getSynopsis());
            animeDb.setStatus(animeUpdate.getStatus());
            animeDb.setGenre(animeUpdate.getGenre());
            animeDb.setReleaseYear(animeUpdate.getReleaseYear());
            animeDb.setSeason(animeUpdate.getSeason());
            
            animeRepository.save(animeDb);
            return ResponseEntity.ok().body("{\"message\": \"Anime actualizado correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/animes/{id}")
    public ResponseEntity<?> eliminarAnime(@PathVariable Long id) {
        try {
            animeRepository.deleteById(id);
            return ResponseEntity.ok().body("{\"message\": \"Anime eliminado correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}