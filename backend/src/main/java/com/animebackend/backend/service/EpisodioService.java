package com.animebackend.backend.service;

import java.util.List;

import com.animebackend.backend.entity.Episode;

public interface EpisodioService {
    List<Episode> obtenerTodos();
    
    // Más adelante agregaremos aquí: guardar, actualizar y eliminar
}
