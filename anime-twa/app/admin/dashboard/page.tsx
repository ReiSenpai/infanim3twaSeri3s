"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

const PREDEFINED_GENRES = [
  "Acción", "Aventura", "Autos", "Comedia", "Drama", "Romance", "Ecchi", 
  "Fantasía", "Juegos", "Terror", "Isekai", "Música", "Samurai", "Escolar", 
  "Shoujo", "Deporte", "Yaoi", "Yuri", "Harem", "Recuentos de vida", 
  "Sobrenatural", "Militar", "Seinen", "Sci-Fi"
].sort();

interface Anime {
  id: number;
  slug: string;
  title: string;
  status?: string;
  coverUrl?: string;
  synopsis?: string;
  genre?: string;
  releaseYear?: number;
  season?: string;
}

interface Episode {
  id: number;
  episodeNumber: number;
  videoUrl: string;
  anime?: Anime;
  synopsis?: string;
}

interface TelegramChannel {
  id: number;
  name: string;
  chatId: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        ready: () => void;
        setBackgroundColor: (color: string) => void;
        initDataUnsafe?: { user?: { first_name: string; }; };
      };
    };
  }
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Administrador");
  const [activeTab, setActiveTab] = useState("episodes"); 

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [channels, setChannels] = useState<TelegramChannel[]>([]);

  // ESTADOS EPISODIOS
  const [loadingEp, setLoadingEp] = useState(false);
  const [msgEp, setMsgEp] = useState({ text: "", type: "" });
  const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);
  const [formDataEp, setFormDataEp] = useState({ animeId: "", animeTitle: "", episodeNumber: "", videoUrl: "", synopsis: "" });

  // ESTADOS ANIMES
  const [loadingAn, setLoadingAn] = useState(false);
  const [msgAn, setMsgAn] = useState({ text: "", type: "" });
  const [editingAnimeId, setEditingAnimeId] = useState<number | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [formDataAn, setFormDataAn] = useState({ slug: "", title: "", coverUrl: "", synopsis: "", status: "EMISION", releaseYear: new Date().getFullYear().toString(), season: "Primavera" });

  // ESTADOS CANALES
  const [loadingCh, setLoadingCh] = useState(false);
  const [msgCh, setMsgCh] = useState({ text: "", type: "" });
  const [editingChannelId, setEditingChannelId] = useState<number | null>(null);
  const [formDataCh, setFormDataCh] = useState({ name: "", chatId: "" });

  const fetchData = async () => {
    try {
      const [resAnimes, resEpisodes, resChannels] = await Promise.all([
        fetch("https://anime-backend-prod.onrender.com/api/v1/admin/animes"),
        fetch("https://anime-backend-prod.onrender.com/api/v1/admin/episodes"),
        fetch("https://anime-backend-prod.onrender.com/api/v1/admin/channels").catch(() => null)
      ]);
      
      if (resAnimes.ok) {
        const dataAnimes: Anime[] = await resAnimes.json();
        // Ordenar animes de más reciente a más antiguo por ID
        setAnimes(dataAnimes.sort((a, b) => b.id - a.id));
      }
      
      if (resEpisodes.ok) {
        const dataEps: Episode[] = await resEpisodes.json();
        // Ordenar todos los episodios de más reciente a antiguo
        setEpisodes(dataEps.sort((a, b) => b.id - a.id));
      }
      
      if (resChannels && resChannels.ok) setChannels(await resChannels.json());
    } catch (error) { console.error("Error al cargar datos:", error); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        if (tg.initDataUnsafe?.user?.first_name) setAdminName(tg.initDataUnsafe.user.first_name);
        setIsAdmin(true); 
      } else { setIsAdmin(true); }
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // AGRUPAR EPISODIOS EN CARPETAS POR ANIME
  const groupedEpisodes = episodes.reduce((acc, ep) => {
    const animeTitle = ep.anime?.title || "Anime Desconocido";
    if (!acc[animeTitle]) acc[animeTitle] = [];
    acc[animeTitle].push(ep);
    return acc;
  }, {} as Record<string, Episode[]>);


  // ================= METODOS EPISODIOS =================
  const handleChangeEp = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormDataEp({ ...formDataEp, [e.target.name]: e.target.value });
  const handleSubmitEp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingEp(true); setMsgEp({ text: "", type: "" });
    const url = editingEpisodeId ? `https://anime-backend-prod.onrender.com/api/v1/admin/episodes/${editingEpisodeId}` : "https://anime-backend-prod.onrender.com/api/v1/admin/episodes";
    const method = editingEpisodeId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formDataEp) });
      if (res.ok) { setMsgEp({ text: editingEpisodeId ? "¡Actualizado!" : "¡Guardado!", type: "success" }); cancelEditEp(); fetchData(); } else throw new Error("Error al guardar");
    } catch (err: unknown) { setMsgEp({ text: err instanceof Error ? err.message : "Error", type: "error" }); } finally { setLoadingEp(false); }
  };
  const handleEditEp = (ep: Episode) => { setEditingEpisodeId(ep.id); setFormDataEp({ animeId: ep.anime?.slug || "", animeTitle: ep.anime?.title || "", episodeNumber: ep.episodeNumber.toString(), videoUrl: ep.videoUrl, synopsis: ep.synopsis || "" }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDeleteEp = async (id: number) => { if (!window.confirm("¿Eliminar?")) return; try { const res = await fetch(`https://anime-backend-prod.onrender.com/api/v1/admin/episodes/${id}`, { method: "DELETE" }); if (res.ok) fetchData(); } catch (error) { console.error(error); } };
  const cancelEditEp = () => { setEditingEpisodeId(null); setFormDataEp({ animeId: "", animeTitle: "", episodeNumber: "", videoUrl: "", synopsis: "" }); };

  // ================= METODOS ANIMES =================
  const handleChangeAn = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormDataAn({ ...formDataAn, [e.target.name]: e.target.value });
  const toggleGenre = (genre: string) => { setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]); };
  const handleSubmitAn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingAn(true); setMsgAn({ text: "", type: "" });
    const url = editingAnimeId ? `https://anime-backend-prod.onrender.com/api/v1/admin/animes/${editingAnimeId}` : "https://anime-backend-prod.onrender.com/api/v1/admin/animes";
    const method = editingAnimeId ? "PUT" : "POST";
    try {
      const payload = { ...formDataAn, genre: selectedGenres.join(", "), releaseYear: parseInt(formDataAn.releaseYear) || new Date().getFullYear() };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { setMsgAn({ text: editingAnimeId ? "¡Actualizado!" : "¡Registrado!", type: "success" }); cancelEditAn(); fetchData(); } else throw new Error("Error al guardar");
    } catch (err: unknown) { setMsgAn({ text: err instanceof Error ? err.message : "Error", type: "error" }); } finally { setLoadingAn(false); }
  };
  const handleEditAn = (anime: Anime) => { setEditingAnimeId(anime.id); setFormDataAn({ slug: anime.slug, title: anime.title, coverUrl: anime.coverUrl || "", synopsis: anime.synopsis || "", status: anime.status || "EMISION", releaseYear: anime.releaseYear?.toString() || new Date().getFullYear().toString(), season: anime.season || "Primavera" }); setSelectedGenres(anime.genre ? anime.genre.split(", ") : []); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDeleteAn = async (id: number) => { if (!window.confirm("¿Borrar Anime y episodios?")) return; try { const res = await fetch(`https://anime-backend-prod.onrender.com/api/v1/admin/animes/${id}`, { method: "DELETE" }); if (res.ok) fetchData(); } catch (error) { console.error(error); } };
  const cancelEditAn = () => { setEditingAnimeId(null); setFormDataAn({ slug: "", title: "", coverUrl: "", synopsis: "", status: "EMISION", releaseYear: new Date().getFullYear().toString(), season: "Primavera" }); setSelectedGenres([]); };

  // ================= METODOS CANALES =================
  const handleChangeCh = (e: React.ChangeEvent<HTMLInputElement>) => setFormDataCh({ ...formDataCh, [e.target.name]: e.target.value });
  const handleSubmitCh = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingCh(true); setMsgCh({ text: "", type: "" });
    const url = editingChannelId ? `https://anime-backend-prod.onrender.com/api/v1/admin/channels/${editingChannelId}` : "https://anime-backend-prod.onrender.com/api/v1/admin/channels";
    const method = editingChannelId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formDataCh) });
      if (res.ok) { setMsgCh({ text: editingChannelId ? "¡Actualizado!" : "¡Registrado!", type: "success" }); cancelEditCh(); fetchData(); } else throw new Error("Error al guardar");
    } catch (err: unknown) { setMsgCh({ text: err instanceof Error ? err.message : "Error", type: "error" }); } finally { setLoadingCh(false); }
  };
  const handleEditCh = (channel: TelegramChannel) => { setEditingChannelId(channel.id); setFormDataCh({ name: channel.name, chatId: channel.chatId }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDeleteCh = async (id: number) => { if (!window.confirm("¿Desvincular canal?")) return; try { const res = await fetch(`https://anime-backend-prod.onrender.com/api/v1/admin/channels/${id}`, { method: "DELETE" }); if (res.ok) fetchData(); } catch (error) { console.error(error); } };
  const cancelEditCh = () => { setEditingChannelId(null); setFormDataCh({ name: "", chatId: "" }); };

  if (!isAdmin) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><h1 className="text-red-400 text-xl font-bold">Cargando...</h1></div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .glass-panel { background: rgba(20, 20, 25, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); }
        .input-field { width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px 14px; color: white; outline: none; transition: all 0.3s ease; }
        .input-field:focus { border-color: #3b82f6; background: rgba(0, 0, 0, 0.6); }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.5); border-radius: 8px; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}} />

      {/* BARRA LATERAL */}
      <aside className="w-full md:w-64 glass-panel md:min-h-screen rounded-none p-6 flex flex-col gap-6 z-10 shrink-0">
        <div><h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AnimeAdmin</h1></div>
        <nav className="flex flex-row md:flex-col gap-3 overflow-x-auto">
          <button onClick={() => { setActiveTab("animes"); setMsgAn({text:"", type:""}); }} className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "animes" ? "bg-blue-600/80 border border-blue-400/30" : "text-gray-400 hover:bg-white/5"}`}>📚 Animes</button>
          <button onClick={() => { setActiveTab("episodes"); setMsgEp({text:"", type:""}); }} className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "episodes" ? "bg-purple-600/80 border border-purple-400/30" : "text-gray-400 hover:bg-white/5"}`}>🎬 Episodios</button>
          <button onClick={() => { setActiveTab("channels"); setMsgCh({text:"", type:""}); }} className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "channels" ? "bg-cyan-600/80 border border-cyan-400/30" : "text-gray-400 hover:bg-white/5"}`}>📢 Canales</button>
        </nav>
        <div className="mt-auto pt-4 border-t border-white/5"><SignOutButton redirectUrl="/admin/dashboard"><button className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left text-red-400 hover:bg-red-500/20">🚪 Cerrar Sesión</button></SignOutButton></div>
      </aside>

      {/* CONTENIDO PRINCIPAL A ANCHO COMPLETO */}
      <section className="flex-1 p-4 md:p-8 overflow-y-auto h-screen z-10 w-full">
        
        {/* ==================== VISTA EPISODIOS ==================== */}
        {activeTab === "episodes" && (
          <div className="w-full space-y-8 animate-fade-up">
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-purple-300">{editingEpisodeId ? "✏️ Editar" : "➕ Agregar"} Episodio</h2>
              {msgEp.text && <div className="p-4 mb-6 rounded-xl text-sm font-semibold bg-white/10">{msgEp.text}</div>}
              <form onSubmit={handleSubmitEp} className="space-y-5 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Seleccionar Anime</label><select name="animeId" value={formDataEp.animeId} onChange={(e) => { const a = animes.find(x => x.slug === e.target.value); setFormDataEp({ ...formDataEp, animeId: e.target.value, animeTitle: a ? a.title : "" }); }} required className="input-field"><option value="">Elegir...</option>{animes.map((a) => (<option key={a.id} value={a.slug}>{a.title}</option>))}</select></div>
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Anime</label><input type="text" name="animeTitle" value={formDataEp.animeTitle} readOnly className="input-field opacity-50 bg-black/40" /></div>
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Número</label><input type="number" name="episodeNumber" value={formDataEp.episodeNumber} onChange={handleChangeEp} required className="input-field" /></div>
                </div>
                <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">URL del Video</label><input type="url" name="videoUrl" value={formDataEp.videoUrl} onChange={handleChangeEp} required className="input-field" /></div>
                <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Sinopsis</label><textarea name="synopsis" value={formDataEp.synopsis} onChange={handleChangeEp} required rows={2} className="input-field resize-none"></textarea></div>
                <div className="flex gap-4 md:w-1/3"><button type="submit" disabled={loadingEp} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors">{loadingEp ? "..." : "Guardar"}</button>{editingEpisodeId && <button type="button" onClick={cancelEditEp} className="px-8 py-3 bg-white/10 rounded-xl">Cancelar</button>}</div>
              </form>
            </div>
            
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-purple-300">📋 Episodios ({episodes.length})</h2>
              
              {/* LISTA AGRUPADA EN CARPETAS POR ANIME */}
              <div className="space-y-3">
                {Object.keys(groupedEpisodes).map((animeTitle) => (
                  <details key={animeTitle} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden group">
                    <summary className="p-4 cursor-pointer font-bold text-gray-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        {animeTitle}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">{groupedEpisodes[animeTitle].length} eps</span>
                        <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </summary>
                    <div className="p-4 bg-black/50 border-t border-white/5">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-gray-400 border-b border-white/10">
                            <tr><th className="pb-3 px-2">Episodio</th><th className="pb-3 px-2 text-right">Acciones</th></tr>
                          </thead>
                          <tbody>
                            {groupedEpisodes[animeTitle].map((ep) => (
                              <tr key={ep.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2 text-gray-300">Episodio {ep.episodeNumber}</td>
                                <td className="py-3 px-2 text-right">
                                  <button onClick={() => handleEditEp(ep)} className="text-yellow-400 hover:text-yellow-300 px-3 py-1 font-semibold">Editar</button>
                                  <button onClick={() => handleDeleteEp(ep.id)} className="text-red-400 hover:text-red-300 px-3 py-1 font-semibold">Eliminar</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ==================== VISTA ANIMES ==================== */}
        {activeTab === "animes" && (
          <div className="w-full space-y-8 animate-fade-up">
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-blue-300">{editingAnimeId ? "✏️ Editar" : "➕ Registrar"} Anime</h2>
              {msgAn.text && <div className="p-4 mb-6 rounded-xl text-sm font-semibold bg-white/10">{msgAn.text}</div>}
              <form onSubmit={handleSubmitAn} className="space-y-5 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Slug</label><input type="text" name="slug" value={formDataAn.slug} onChange={handleChangeAn} required className="input-field" /></div>
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Título</label><input type="text" name="title" value={formDataAn.title} onChange={handleChangeAn} required className="input-field" /></div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase">Géneros ({selectedGenres.length} seleccionados)</label>
                  <div className="flex flex-wrap gap-2 p-4 border border-white/10 rounded-xl bg-black/40">
                    {PREDEFINED_GENRES.map((g) => (
                      <button type="button" key={g} onClick={() => toggleGenre(g)} className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all active:scale-95 ${ selectedGenres.includes(g) ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Año</label><input type="number" name="releaseYear" value={formDataAn.releaseYear} onChange={handleChangeAn} required className="input-field" /></div>
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Temporada</label><select name="season" value={formDataAn.season} onChange={handleChangeAn} className="input-field"><option value="Primavera">Primavera</option><option value="Verano">Verano</option><option value="Otoño">Otoño</option><option value="Invierno">Invierno</option></select></div>
                  <div className="space-y-1 lg:col-span-2"><label className="text-xs text-gray-400 uppercase">Estado</label><select name="status" value={formDataAn.status} onChange={handleChangeAn} className="input-field"><option value="EMISION">En Emisión</option><option value="FINALIZADO">Finalizado</option></select></div>
                </div>
                <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">URL Portada</label><input type="url" name="coverUrl" value={formDataAn.coverUrl} onChange={handleChangeAn} required className="input-field" /></div>
                <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Sinopsis</label><textarea name="synopsis" value={formDataAn.synopsis} onChange={handleChangeAn} required rows={3} className="input-field resize-none"></textarea></div>
                <div className="flex gap-4 md:w-1/3"><button type="submit" disabled={loadingAn} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors">{loadingAn ? "..." : "Guardar"}</button>{editingAnimeId && <button type="button" onClick={cancelEditAn} className="px-8 py-3 bg-white/10 rounded-xl">Cancelar</button>}</div>
              </form>
            </div>
            
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-blue-300">📋 Animes ({animes.length})</h2>
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-black/40 text-gray-400 border-b border-white/10"><tr><th className="px-5 py-4">ID</th><th className="px-5 py-4">Título / Géneros</th><th className="px-5 py-4">Año/Temp</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody>{animes.map((a) => (<tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="px-5 py-4 text-gray-400">{a.slug}</td><td className="px-5 py-4"><div className="font-bold text-white">{a.title}</div><div className="text-[10px] text-gray-500 mt-1 max-w-[250px] truncate">{a.genre}</div></td><td className="px-5 py-4 text-gray-300">{a.season} {a.releaseYear}</td><td className="px-5 py-4 text-right"><button onClick={() => handleEditAn(a)} className="text-yellow-400 hover:text-yellow-300 px-3 py-1 font-semibold">Editar</button><button onClick={() => handleDeleteAn(a.id)} className="text-red-400 hover:text-red-300 px-3 py-1 font-semibold">Eliminar</button></td></tr>))}</tbody></table></div>
            </div>
          </div>
        )}

        {/* ==================== VISTA CANALES ==================== */}
        {activeTab === "channels" && (
          <div className="w-full space-y-8 animate-fade-up">
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-cyan-300">{editingChannelId ? "✏️ Editar" : "➕ Vincular"} Canal</h2>
              {msgCh.text && <div className="p-4 mb-6 rounded-xl text-sm bg-white/10">{msgCh.text}</div>}
              <form onSubmit={handleSubmitCh} className="space-y-5 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Nombre</label><input type="text" name="name" value={formDataCh.name} onChange={handleChangeCh} required className="input-field" /></div>
                  <div className="space-y-1"><label className="text-xs text-gray-400 uppercase">Chat ID</label><input type="text" name="chatId" value={formDataCh.chatId} onChange={handleChangeCh} required className="input-field font-mono" /></div>
                </div>
                <div className="flex gap-4 md:w-1/3"><button type="submit" disabled={loadingCh} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-colors">Guardar</button>{editingChannelId && <button type="button" onClick={cancelEditCh} className="px-8 py-3 bg-white/10 rounded-xl">Cancelar</button>}</div>
              </form>
            </div>
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-cyan-300">📢 Canales ({channels.length})</h2>
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-black/40 text-gray-400 border-b border-white/10"><tr><th className="px-5 py-4">Nombre</th><th className="px-5 py-4">Chat ID</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody>{channels.map((c) => (<tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="px-5 py-4 font-semibold text-white">{c.name}</td><td className="px-5 py-4 text-gray-400 font-mono">{c.chatId}</td><td className="px-5 py-4 text-right"><button onClick={() => handleEditCh(c)} className="text-yellow-400 hover:text-yellow-300 px-3 py-1 font-semibold">Editar</button><button onClick={() => handleDeleteCh(c.id)} className="text-red-400 hover:text-red-300 px-3 py-1 font-semibold">Desvincular</button></td></tr>))}</tbody></table></div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}