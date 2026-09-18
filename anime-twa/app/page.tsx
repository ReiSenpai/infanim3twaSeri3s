"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image"; 

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        ready: () => void;
        setBackgroundColor: (color: string) => void;
        initDataUnsafe?: {
          user?: {
            first_name: string;
          };
        };
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
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return { isVisible, domRef };
}

function FadeUpSection({ children, delayMs = 0 }: { children: ReactNode; delayMs?: number }) {
  const { isVisible, domRef } = useScrollObserver();
  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
}

interface CatalogItem {
  animeSlug: string;
  episodeNumber: number;
  animeTitle: string;
  episodeTitle: string;
  coverUrl: string;
}

interface AnimeItem {
  slug: string;
  title: string;
  coverUrl: string;
  status: string;
  releaseYear?: number;
}

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
      
      try {
        tg.setBackgroundColor('#050505');
      } catch (e) {
        console.warn("Fallo al fijar color:", e); 
      }

      if (tg.initDataUnsafe?.user?.first_name) {
        const firstName = tg.initDataUnsafe.user.first_name;
        setTimeout(() => setTgUser(firstName), 0);
      }
    }

    const fetchData = async () => {
      try {
        // Fetch de episodios recientes
        const resEps = await fetch('/api/v1/animes/recent-episodes');
        if (resEps.ok) {
          const data = await resEps.json();
          setRecentEpisodes(data);
        }

        // Fetch de animes recientes para el sidebar (Asumiendo que esta es tu ruta de animes)
        const resAnimes = await fetch('/api/v1/admin/animes');
        if (resAnimes.ok) {
          const dataAnimes: AnimeItem[] = await resAnimes.json();
          // Invertimos para tener los últimos y cortamos a 6 para el sidebar
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
    <main className="min-h-screen bg-[#050505] text-white p-5 overflow-x-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glow-text {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}} />

      {/* HEADER PRINCIPAL */}
      <FadeUpSection delayMs={50}>
        <header className="glass-panel px-5 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-[0_8px_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500"></div>
          <div className="flex flex-col z-10">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-md">
              SOMOS <span className="text-blue-400 glow-text">INFANIME</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">
              La mejor comunidad Anime
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner z-10 shrink-0">
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </header>
      </FadeUpSection>

      {/* CONTENEDOR PRINCIPAL: DIVIDIDO EN 2 COLUMNAS EN PANTALLAS GRANDES */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mb-auto">
        
        {/* COLUMNA IZQUIERDA: EPISODIOS (Ocupa el espacio restante) */}
        <div className="flex-1">
          <FadeUpSection delayMs={150}>
            {/* Header de Episodios con el botón Catálogo al otro extremo */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-blue-400 mb-1 font-mono">
                  {tgUser ? `Hola de nuevo, ${tgUser} ✌️` : "Bienvenido al Hub"}
                </p>
                <h2 className="text-3xl font-black tracking-tighter glow-text">
                  Últimos Estrenos
                </h2>
              </div>
              <Link href="/catalog">
                <button className="px-5 py-2.5 glass-panel rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2">
                  <span>Ir al Catálogo</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </Link>
            </div>
          </FadeUpSection>

          {recentEpisodes.length === 0 ? (
            <FadeUpSection delayMs={200}>
              <div className="text-center text-gray-500 mt-6 p-6 glass-panel rounded-xl">
                Aún no hay capítulos disponibles en la base de datos.
              </div>
            </FadeUpSection>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mt-2">
              {/* SLICE(0, 26) LIMITA A 26 EPISODIOS MÁXIMO */}
              {recentEpisodes.slice(0, 26).map((ep, index) => (
                <FadeUpSection key={`${ep.animeSlug}-${ep.episodeNumber}`} delayMs={(index * 50) + 200}>
                  <Link href={`/anime/${ep.animeSlug}/ep-${ep.episodeNumber}`} className="block group">
                    <div className="glass-panel rounded-xl overflow-hidden relative aspect-[3/4] shadow-lg transition-transform duration-300 active:scale-95 bg-[#111]">
                      {ep.coverUrl ? (
                        <Image src={ep.coverUrl} alt={ep.animeTitle} fill unoptimized className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      )}
                      
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/20">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Nuevo</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
                        <h3 className="text-sm font-bold leading-tight truncate mb-1 text-white">
                          {ep.animeTitle}
                        </h3>
                        <p className="text-xs text-blue-400 font-semibold truncate">
                          Ep. {ep.episodeNumber} - {ep.episodeTitle || "Sub Español"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </FadeUpSection>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: ANIMES RECIENTES (Fija a 320px en PC) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          <FadeUpSection delayMs={300}>
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-xl font-bold tracking-tight text-white mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                ANIMES RECIENTES
              </h3>
              
              <div className="flex flex-col gap-4">
                {recentAnimes.length === 0 ? (
                  <p className="text-xs text-gray-500">No hay animes recientes.</p>
                ) : (
                  recentAnimes.map((anime) => (
                    <Link key={anime.slug} href={`/anime/${anime.slug}`} className="group">
                      <div className="flex gap-4 items-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10 shadow-md">
                          <Image src={anime.coverUrl} alt={anime.title} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-bold text-gray-200 group-hover:text-white line-clamp-2 leading-tight">
                            {anime.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${anime.status === 'EMISION' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {anime.status === 'EMISION' ? 'En Emisión' : 'Concluido'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-500/20 text-blue-400">
                              Serie
                            </span>
                          </div>
                          {anime.releaseYear && (
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {anime.releaseYear}
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
      
      {/* FOOTER */}
      <FadeUpSection delayMs={600}>
        <footer className="mt-12 mb-8 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-16">
              <Image 
                src="/Somosinf.png" 
                alt="Somos Infanime Logo" 
                fill 
                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
              />
            </div>
            <p className="text-gray-500 text-sm font-semibold tracking-widest">
              © 2026 SOMOSINFANIME
            </p>
          </div>

          <div className="flex gap-4 mt-2">
            <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.15)]" title="Canal Principal">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/>
              </svg>
            </a>
            <a href="https://t.me/DirectorioInfanimeOfc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)]" title="Directorio Infanime">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/>
              </svg>
            </a>
            <a href="https://linktr.ee/SomosInfanime" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.15)]" title="Nuestras Redes (Linktree)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.736 12.355l4.316-4.315-1.554-1.554-4.316 4.315V0h-2.196v10.801L5.67 6.486 4.116 8.04l4.315 4.315H0v2.196h8.431l-4.148 4.147 1.554 1.554 4.148-4.148v6.079h2.196v-6.079l4.148 4.148 1.554-1.554-4.148-4.147H24v-2.196h-8.431z"/>
              </svg>
            </a>
          </div>
        </footer>
      </FadeUpSection>

      <div className="h-12 w-full"></div>
    </main>
  );
}