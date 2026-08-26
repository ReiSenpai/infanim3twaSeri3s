package com.animebackend.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "animes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug; 

    @Column(nullable = false)
    private String title;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    private String status; 

    // 👇 NUEVOS CAMPOS AGREGADOS
    private String genre;
    
    @Column(name = "release_year")
    private Integer releaseYear;
    
    private String season;

    // Relación 1 a N con Episodio
    @JsonIgnore 
    @OneToMany(mappedBy = "anime", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Episode> episodes = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}