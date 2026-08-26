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
        // Obtenemos todos los animes y buscamos el que coincida
        const resAnimes = await fetch("/api/v1/admin/animes");
        if (resAnimes.ok) {
          const allAnimes: Anime[] = await resAnimes.json();
          const currentAnime = allAnimes.find(a => a.slug === animeId);
          if (currentAnime) setAnime(currentAnime);
        }

        // Obtenemos los episodios y los filtramos
        const resEps = await fetch("/api/v1/admin/episodes");
        if (resEps.ok) {
          const allEps: Episode[] = await resEps.json();
          // Filtramos solo los episodios de este anime y los ordenamos de 1 a X
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
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}} />

      {/* PORTADA Y TÍTULO */}
      <div className="relative w-full h-64 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
        {anime.coverUrl && (
          <Image src={anime.coverUrl} alt={anime.title} fill unoptimized className="object-cover opacity-60" />
        )}
        
        <Link href="/catalog" className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 text-white active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>

        <div className="absolute bottom-0 left-0 w-full p-5 z-20">
          <span className={`px-2 py-1 text-[10px] font-bold rounded border ${anime.status === 'EMISION' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'} mb-2 inline-block`}>
            {anime.status === 'EMISION' ? '🟢 EN EMISIÓN' : '🔴 FINALIZADO'}
          </span>
          <h1 className="text-3xl font-black tracking-tighter leading-tight drop-shadow-lg">{anime.title}</h1>
        </div>
      </div>

      {/* SINOPSIS */}
      <div className="px-5 mt-4">
        <p className="text-gray-300 text-sm leading-relaxed text-justify glass-panel p-4 rounded-xl">
          {anime.synopsis}
        </p>
      </div>

      {/* LISTA DE CAPÍTULOS */}
      <div className="px-5 mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
          Lista de Capítulos ({episodes.length})
        </h2>
        
        {episodes.length === 0 ? (
          <div className="text-center text-gray-500 py-8 glass-card rounded-xl">
            Aún no hay capítulos disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {episodes.map((ep) => (
              <Link key={ep.id} href={`/anime/${anime.slug}/ep-${ep.episodeNumber}`}>
                <div className="glass-card p-4 rounded-xl flex items-center justify-between active:scale-95 transition-transform hover:bg-white/5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {ep.episodeNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-white">Episodio {ep.episodeNumber}</p>
                      <p className="text-xs text-gray-400">Sub Español</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}