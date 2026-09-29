"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image"; 

// 🔥 1. Importamos tus nuevos componentes
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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

function useScrollObserver() {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return { isVisible, domRef };
}

function FadeUpSection({ children, delayMs = 0 }: { children: ReactNode; delayMs?: number }) {
  const { isVisible, domRef } = useScrollObserver();
  return (
    <div ref={domRef} style={{ transitionDelay: `${delayMs}ms` }} className={`transition-all duration-700 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
      {children}
    </div>
  );
}

interface CatalogItem { animeSlug: string; episodeNumber: number; animeTitle: string; episodeTitle: string; coverUrl: string; }
interface AnimeItem { slug: string; title: string; coverUrl: string; status: string; releaseYear?: number; season?: string; }

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [recentEpisodes, setRecentEpisodes] = useState<CatalogItem[]>([]);
  const [recentAnimes, setRecentAnimes] = useState<AnimeItem[]>([]);
  const [tgUser, setTgUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      tg.ready();
      try { tg.setBackgroundColor('#050505'); } catch (e) { console.warn("Fallo al fijar color:", e); }
      if (tg.initDataUnsafe?.user?.first_name) {
        setTimeout(() => setTgUser(tg.initDataUnsafe!.user!.first_name), 0);
      }
    }

    const fetchData = async () => {
      try {
        const resEps = await fetch('/api/v1/animes/recent-episodes');
        if (resEps.ok) {
          const data: CatalogItem[] = await resEps.json();
          setRecentEpisodes(data.reverse());
        }

        const resAnimes = await fetch('/api/v1/admin/animes');
        if (resAnimes.ok) {
          const dataAnimes: AnimeItem[] = await resAnimes.json();
          setRecentAnimes(dataAnimes.reverse().slice(0, 6)); 
        }
      } catch (err) {
        console.error("Error conectando con el backend:", err);
      } finally {
        setTimeout(() => setIsLoaded(true), 800);
      }
    };
    fetchData();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-mono text-sm animate-pulse">Sincronizando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-6 flex flex-col w-full">
      
      {/* 🔥 2. Usamos el componente Navbar */}
      <FadeUpSection delayMs={50}>
        <Navbar />
      </FadeUpSection>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mb-auto w-full max-w-[1600px] mx-auto">
        
        {/* COLUMNA IZQUIERDA: EPISODIOS */}
        <div className="flex-1 w-full">
          <FadeUpSection delayMs={150}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <p className="text-sm text-blue-400 mb-1 font-mono">
                  {tgUser ? `Hola de nuevo, ${tgUser} ✌️` : "Bienvenido al Hub"}
                </p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter glow-text">Últimos Estrenos</h2>
              </div>
              <Link href="/catalog">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-400/50">
                  <span>Ir al Catálogo</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </Link>
            </div>
          </FadeUpSection>

          {recentEpisodes.length === 0 ? (
            <FadeUpSection delayMs={200}>
              <div className="text-center text-gray-500 mt-6 p-6 glass-panel rounded-xl">Aún no hay capítulos disponibles en la base de datos.</div>
            </FadeUpSection>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mt-2">
              {recentEpisodes.slice(0, 24).map((ep, index) => (
                <FadeUpSection key={`${ep.animeSlug}-${ep.episodeNumber}`} delayMs={(index * 50) + 200}>
                  <Link href={`/anime/${ep.animeSlug}/ep-${ep.episodeNumber}`} className="block group">
                    <div className="glass-panel rounded-xl overflow-hidden relative aspect-video shadow-lg transition-transform duration-300 active:scale-95 bg-black border border-white/10">
                      {ep.coverUrl ? (
                        <Image src={ep.coverUrl} alt={ep.animeTitle} fill unoptimized className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-80"></div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-12 h-12 bg-blue-600/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.5)] transform group-hover:scale-110 duration-300">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-md px-2 py-1 rounded border border-red-400/50 z-20 shadow-lg">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Nuevo</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 z-20">
                        <h3 className="text-sm md:text-base font-bold leading-tight truncate mb-1 text-white drop-shadow-md">{ep.animeTitle}</h3>
                        <p className="text-xs text-blue-300 font-semibold truncate drop-shadow-md">Episodio {ep.episodeNumber}</p>
                      </div>
                    </div>
                  </Link>
                </FadeUpSection>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: ANIMES RECIENTES */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-5">
          <FadeUpSection delayMs={300}>
            <div className="glass-panel p-5 rounded-2xl sticky top-6">
              <h3 className="text-xl font-bold tracking-tight text-white mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span> ANIMES RECIENTES
              </h3>
              <div className="flex flex-col gap-4">
                {recentAnimes.length === 0 ? (
                  <p className="text-xs text-gray-500">No hay animes recientes.</p>
                ) : (
                  recentAnimes.map((anime) => (
                    <Link key={anime.slug} href={`/anime/${anime.slug}`} className="group">
                      <div className="flex gap-4 items-center p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10 shadow-md">
                          <Image src={anime.coverUrl} alt={anime.title} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <h4 className="text-sm font-bold text-gray-200 group-hover:text-white line-clamp-2 leading-tight">{anime.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${anime.status === 'EMISION' ? 'bg-red-500/90 text-white' : 'bg-gray-600/90 text-white'}`}>
                              {anime.status === 'EMISION' ? 'En Emisión' : 'Concluido'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/90 text-white">Serie</span>
                          </div>
                          {anime.releaseYear && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {anime.season || "Estreno"} de {anime.releaseYear}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </FadeUpSection>
        </div>
      </div>
      
      {/* 🔥 3. Usamos el componente Footer */}
      <FadeUpSection delayMs={600}>
        <Footer />
      </FadeUpSection>
      
    </main>
  );
}