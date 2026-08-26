package com.animebackend.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.animebackend.backend.entity.Episode;
import com.animebackend.backend.repository.EpisodeRepository;
import com.animebackend.backend.service.EpisodioService;

import java.util.List;

@Service
public class EpisodioServiceImpl implements EpisodioService {

    @Autowired
    private EpisodeRepository episodeRepository; // Asumo que ya tienes este repositorio

    @Override
    public List<Episode> obtenerTodos() {
        return episodeRepository.findAll();
    }
}
