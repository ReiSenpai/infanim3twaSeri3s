package com.animebackend.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "episodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Episode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "episode_number", nullable = false)
    private Integer episodeNumber;

    private String title;

    // La URL del iframe o reproductor (Ej: mp4upload, Mega, Mixdrop)
    // Le agregamos columnDefinition = "TEXT" para que soporte enlaces largos
    @Column(name = "source_url", nullable = false, columnDefinition = "TEXT")
    private String sourceUrl;

    // La URL directa del .mp4 extraída por el backend
    @Column(name = "direct_mp4_url", columnDefinition = "TEXT")
    private String directMp4Url;

    // Relación N a 1 con Anime
    // Usamos EAGER para que al listar los episodios, envíe también los datos del anime a Next.js
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "anime_id", nullable = false)
    private Anime anime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ==========================================
    // MÉTODOS ADAPTADORES PARA EL CONTROLADOR
    // ==========================================
    
    // Cuando el AdminController mande "videoUrl", lo guardamos en "sourceUrl"
    public void setVideoUrl(String videoUrl) {
        this.sourceUrl = videoUrl;
    }

    // Y para que el frontend pueda leerlo correctamente como "videoUrl"
    public String getVideoUrl() {
        return this.sourceUrl;
    }
}