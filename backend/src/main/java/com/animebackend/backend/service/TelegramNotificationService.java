package com.animebackend.backend.service;

import com.animebackend.backend.entity.TelegramChannel;
import com.animebackend.backend.repository.TelegramChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TelegramNotificationService {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Autowired
    private TelegramChannelRepository channelRepository;

    // 🔥 CORREGIDO: Sin espacios en blanco al final de la URL
    private final String webAppBaseUrl = "https://carry-experiments-electro-represented.trycloudflare.com";

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendNewEpisodeAlert(String animeTitle, String episodeNumber, String animeSlug) {
        String apiUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";

        // 1. CREAR EL HASHTAG AUTOMÁTICO
        String hashtag = "#" + animeTitle.replaceAll("[^a-zA-Z0-9]", "");

        // 2. Armamos el texto
        String message = "🎉 *¡Nuevo Episodio Disponible!*\n\n" +
                         "📺 Anime: *" + animeTitle + "*\n" +
                         "🎬 Episodio: " + episodeNumber + "\n\n" +
                         "Ya puedes verlo completo sin salir de Telegram. ¡Disfrútalo!\n\n" +
                         hashtag;

        // 3. Enlace (Usamos el slug, que ya viene sin espacios desde la Base de Datos)
        String fullUrl = webAppBaseUrl + "/anime/" + animeSlug + "/ep-" + episodeNumber;

        // 4. Creamos el botón
        Map<String, Object> button = new HashMap<>();
        button.put("text", "▶️ Ver Episodio");
        button.put("url", fullUrl); 

        List<Map<String, Object>> row = new ArrayList<>();
        row.add(button);

        List<List<Map<String, Object>>> keyboard = new ArrayList<>();
        keyboard.add(row);

        Map<String, Object> inlineKeyboard = new HashMap<>();
        inlineKeyboard.put("inline_keyboard", keyboard);

        // 5. OBTENER TODOS LOS CANALES DESDE LA BASE DE DATOS
        List<TelegramChannel> canales = channelRepository.findAll();

        if(canales.isEmpty()) {
            System.out.println("⚠️ ALERTA: Episodio guardado, pero no hay canales registrados en la Base de Datos para enviar la notificación.");
            return;
        }

        // 6. ENVIAR A CADA CANAL
        for (TelegramChannel canal : canales) {
            Map<String, Object> request = new HashMap<>();
            request.put("chat_id", canal.getChatId());
            request.put("text", message);
            request.put("parse_mode", "Markdown");
            request.put("reply_markup", inlineKeyboard);

            try {
                restTemplate.postForObject(apiUrl, request, String.class);
                System.out.println("✅ Notificación enviada al canal: " + canal.getName());
            } catch (Exception e) {
                System.err.println("❌ Error al enviar notificación al canal " + canal.getName() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}