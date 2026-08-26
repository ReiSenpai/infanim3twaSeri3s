package com.animebackend.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecentEpisodeDto {
    private String animeSlug;
    private Integer episodeNumber;
    private String animeTitle;
    private String episodeTitle;
    private String coverUrl;
}
