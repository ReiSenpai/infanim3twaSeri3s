"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";

interface Anime {
  id: number;
  slug: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  status: string;
}

interface Episode {
  id: number;
  episodeNumber: number;
  anime?: Anime;
}

export default function AnimeDetailsPage({ params }: { params: Promise<{ animeId: string }> }) {
  const { animeId } = use(params);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }

    const fetchData = async () => {
      try {
        const resAnimes = await fetch("/api/v1/admin/animes");
        if (resAnimes.ok) {
          const allAnimes: Anime[] = await resAnimes.json();
          const currentAnime = allAnimes.find(a => a.slug === animeId);
          if (currentAnime) setAnime(currentAnime);
        }

        const resEps = await fetch("/api/v1/admin/episodes");
        if (resEps.ok) {
          const allEps: Episode[] = await resEps.json();
          const filteredEps = allEps
            .filter(ep => ep.anime?.slug === animeId)
            .sort((a, b) => a.episodeNumber - b.episodeNumber);
          setEpisodes(filteredEps);
        }
      } catch (err) {
        console.error("Error cargando anime", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [animeId]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <h1 className="text-xl">Anime no encontrado</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden pb-12 w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}} />

      {/* ========================================= */}
      {/* SECCIÓN HERO (FONDO DIFUMINADO FULL WIDTH)*/}
      {/* ========================================= */}
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden border-b border-white/5">
        {anime.coverUrl && (
          <Image 
            src={anime.coverUrl} 
            alt="Background" 
            fill 
            unoptimized 
            className="object-cover blur-xl opacity-30 scale-110 w-full" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10"></div>
        
        {/* Botón Volver */}
        <Link href="/catalog" className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20 bg-black/50 backdrop-blur-md p-2.5 rounded-full border border-white/10 text-white active:scale-95 hover:bg-white/10 transition-colors shadow-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
      </div>

      {/* ========================================= */}
      {/* CONTENIDO PRINCIPAL (JUSTIFICADO)         */}
      {/* ========================================= */}
      <div className="relative z-20 w-full px-5 md:px-10 lg:px-16 xl:px-24 -mt-24 md:-mt-40 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end mb-8">
        
        {/* Portada Visible */}
        <div className="relative w-40 h-56 md:w-56 md:h-80 shrink-0 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 bg-black">
          {anime.coverUrl && (
            <Image src={anime.coverUrl} alt={anime.title} fill unoptimized className="object-cover" />
          )}
        </div>

        {/* Título y Estado */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full pb-2 md:pb-4 flex-1">
          <span className={`px-3 py-1 text-xs font-bold rounded-md border ${anime.status === 'EMISION' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'} mb-3 inline-block shadow-sm`}>
            {anime.status === 'EMISION' ? '🔴 EN EMISIÓN' : '⚪ FINALIZADO'}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-tight drop-shadow-lg text-white">
            {anime.title}
          </h1>
        </div>
      </div>

      {/* ========================================= */}
      {/* SINOPSIS (JUSTIFICADA)                    */}
      {/* ========================================= */}
      <div className="w-full px-5 md:px-10 lg:px-16 xl:px-24 mb-12">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-white/90">
          <span className="w-1 h-5 bg-purple-500 rounded-full inline-block shadow-[0_0_10px_rgba(147,51,234,0.8)]"></span>
          Sinopsis
        </h2>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify glass-panel p-5 md:p-6 rounded-xl shadow-lg w-full">
          {anime.synopsis || "No hay sinopsis disponible para este anime."}
        </p>
      </div>

      {/* ========================================= */}
      {/* LISTA DE CAPÍTULOS (CUADRÍCULA FLUIDA)    */}
      {/* ========================================= */}
      <div className="w-full px-5 md:px-10 lg:px-16 xl:px-24">
        <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
          Lista de Capítulos <span className="text-gray-500 text-sm font-normal">({episodes.length})</span>
        </h2>
        
        {episodes.length === 0 ? (
          <div className="w-full text-center text-gray-500 py-10 glass-card rounded-xl border border-dashed border-white/10">
            <p className="text-lg font-semibold">Aún no hay capítulos disponibles.</p>
            <p className="text-sm mt-1">Vuelve más tarde para ver los estrenos.</p>
          </div>
        ) : (
          /* Grid Responsivo Extendido: de 1 a 6 columnas dependiendo del ancho de pantalla */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {episodes.map((ep) => (
              <Link key={ep.id} href={`/anime/${anime.slug}/ep-${ep.episodeNumber}`} className="w-full">
                <div className="w-full glass-card p-4 rounded-xl flex items-center justify-between active:scale-95 transition-all hover:bg-white/5 hover:border-white/10 group shadow-md hover:shadow-lg">
                  <div className="flex items-center gap-4 min-w-0">
                    
                    {/* Número de episodio estilizado */}
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                      {ep.episodeNumber}
                    </div>
                    
                    {/* Detalles del episodio (con truncate para evitar desbordes) */}
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <p className="font-bold text-white truncate">Episodio {ep.episodeNumber}</p>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Sub Español
                      </span>
                    </div>
                  </div>

                  {/* Icono de Play interactivo */}
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-colors shrink-0 ml-2">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}