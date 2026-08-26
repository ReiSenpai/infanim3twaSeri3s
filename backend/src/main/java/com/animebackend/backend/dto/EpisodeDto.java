package com.animebackend.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EpisodeDto {
    private String animeTitle;
    private Integer episodeNumber;
    private String episodeTitle;
    private String synopsis;
    private String videoUrl; // Aquí enviaremos el enlace MP4 limpio
}