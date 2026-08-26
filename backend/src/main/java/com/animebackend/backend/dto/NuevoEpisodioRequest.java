package com.animebackend.backend.dto;

public class NuevoEpisodioRequest {
    private String animeId;
    private String animeTitle;
    private String episodeNumber;
    private String videoUrl;
    private String synopsis;

    // Getters y Setters
    public String getAnimeId() { return animeId; }
    public void setAnimeId(String animeId) { this.animeId = animeId; }
    
    public String getAnimeTitle() { return animeTitle; }
    public void setAnimeTitle(String animeTitle) { this.animeTitle = animeTitle; }
    
    public String getEpisodeNumber() { return episodeNumber; }
    public void setEpisodeNumber(String episodeNumber) { this.episodeNumber = episodeNumber; }
    
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    
    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String synopsis) { this.synopsis = synopsis; }
}
