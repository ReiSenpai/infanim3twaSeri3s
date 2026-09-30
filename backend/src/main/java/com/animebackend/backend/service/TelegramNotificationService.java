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

    private final String webAppBaseUrl = "https://infanimetv.vercel.app";

    private final RestTemplate restTemplate = new RestTemplate();

    // ==========================================
    // NOTIFICACIÓN DE NUEVO EPISODIO (Texto)
    // ==========================================
    public void sendNewEpisodeAlert(String animeTitle, String episodeNumber, String animeSlug) {
        String apiUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";

        String hashtag = "#" + animeTitle.replaceAll("[^a-zA-Z0-9]", "");

        String message = "🎉 *¡Nuevo Episodio Disponible!*\n\n" +
                         "📺 Anime: *" + animeTitle + "*\n" +
                         "🎬 Episodio: " + episodeNumber + "\n\n" +
                         "Ya puedes verlo completo sin salir de Telegram. ¡Disfrútalo!\n\n" +
                         hashtag;

        String fullUrl = webAppBaseUrl + "/anime/" + animeSlug + "/ep-" + episodeNumber;

        Map<String, Object> button = new HashMap<>();
        button.put("text", "▶️ Ver Episodio");
        button.put("url", fullUrl); 

        List<Map<String, Object>> row = new ArrayList<>();
        row.add(button);

        List<List<Map<String, Object>>> keyboard = new ArrayList<>();
        keyboard.add(row);

        Map<String, Object> inlineKeyboard = new HashMap<>();
        inlineKeyboard.put("inline_keyboard", keyboard);

        List<TelegramChannel> canales = channelRepository.findAll();

        if(canales.isEmpty()) {
            System.out.println("⚠️ ALERTA: Episodio guardado, pero no hay canales registrados en la Base de Datos para enviar la notificación.");
            return;
        }

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
            }
        }
    }

    // ==========================================
    // NOTIFICACIÓN DE NUEVO ANIME (Con Imagen)
    // ==========================================
    public void sendNewAnimeAlert(String animeTitle, String animeSlug, String coverUrl, String synopsis) {
        // IMPORTANTE: Usamos sendPhoto en lugar de sendMessage
        String apiUrl = "https://api.telegram.org/bot" + botToken + "/sendPhoto";

        String hashtag = "#" + animeTitle.replaceAll("[^a-zA-Z0-9]", "");

        // Telegram limita el 'caption' a 1024 caracteres. Prevenimos errores recortando la sinopsis si es gigante.
        String safeSynopsis = (synopsis != null) ? synopsis : "Sinopsis no disponible.";
        if (safeSynopsis.length() > 600) {
            safeSynopsis = safeSynopsis.substring(0, 597) + "...";
        }

        String caption = "🎊 *¡NUEVO ANIME AGREGADO AL CATÁLOGO!*\n\n" +
                         "📺 Título: *" + animeTitle + "*\n\n" +
                         "📖 Sinopsis:\n_" + safeSynopsis + "_\n\n" +
                         "¡Abre la app para empezar a verlo!\n\n" +
                         hashtag;

        // La ruta ahora apunta a la página general del anime, no a un episodio
        String fullUrl = webAppBaseUrl + "/anime/" + animeSlug;

        Map<String, Object> button = new HashMap<>();
        button.put("text", "📚 Ver Ficha del Anime");
        button.put("url", fullUrl); 

        List<Map<String, Object>> row = new ArrayList<>();
        row.add(button);

        List<List<Map<String, Object>>> keyboard = new ArrayList<>();
        keyboard.add(row);

        Map<String, Object> inlineKeyboard = new HashMap<>();
        inlineKeyboard.put("inline_keyboard", keyboard);

        List<TelegramChannel> canales = channelRepository.findAll();

        if(canales.isEmpty()) {
            System.out.println("⚠️ ALERTA: Anime guardado, pero no hay canales registrados en la BD.");
            return;
        }

        for (TelegramChannel canal : canales) {
            Map<String, Object> request = new HashMap<>();
            request.put("chat_id", canal.getChatId());
            // Telegram admite directamente la URL de la imagen
            request.put("photo", coverUrl);
            request.put("caption", caption); // En fotos se usa 'caption', no 'text'
            request.put("parse_mode", "Markdown");
            request.put("reply_markup", inlineKeyboard);

            try {
                restTemplate.postForObject(apiUrl, request, String.class);
                System.out.println("✅ Notificación de Anime enviada al canal: " + canal.getName());
            } catch (Exception e) {
                System.err.println("❌ Error al enviar alerta de Anime al canal " + canal.getName() + ": " + e.getMessage());
            }
        }
    }
}