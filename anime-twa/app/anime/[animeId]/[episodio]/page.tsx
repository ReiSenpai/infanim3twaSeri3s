"use client";

import { useEffect, useState, useRef, ReactNode, use } from "react";
import Link from "next/link";

// 🔥 Importamos los componentes globales
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setIsVisible(entry.isIntersecting));
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

interface EpisodeData {
  title: string;
  videoUrl: string;
  synopsis: string;
}

export default function EpisodePage({
  params,
}: {
  params: Promise<{ animeId: string; episodio: string }>;
}) {
  const { animeId, episodio } = use(params);

  const [isLoaded, setIsLoaded] = useState(false);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [error, setError] = useState(false);
  const [tgUser, setTgUser] = useState<string | null>(null);
  
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [currentEpNum, setCurrentEpNum] = useState<number>(1);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      tg.ready();

      try {
        tg.setBackgroundColor("#050505");
      } catch (e) {
        console.warn("Fallo al fijar el color de Telegram", e);
      }

      if (tg.initDataUnsafe?.user?.first_name) {
        const firstName = tg.initDataUnsafe.user.first_name;
        setTimeout(() => {
          setTgUser(firstName);
        }, 0);
      }
    }

    const fetchEpisode = async () => {
      try {
        const epNumberStr = episodio.replace(/\D/g, "");
        const epNumInt = parseInt(epNumberStr, 10);
        setCurrentEpNum(epNumInt);

        const res = await fetch(`/api/v1/animes/${animeId}/episodes/${epNumInt}`, { 
          cache: 'no-store' 
        });

        if (!res.ok) {
          throw new Error("Episodio no encontrado en la base de datos");
        }

        const data = await res.json();

        setEpisodeData({
          title: data.animeTitle || data.title,
          videoUrl: data.videoUrl,
          synopsis: data.synopsis,
        });
        
        if (epNumInt > 1) {
          fetch(`/api/v1/animes/${animeId}/episodes/${epNumInt - 1}`, { cache: 'no-store' })
            .then(r => setHasPrev(r.ok))
            .catch(() => setHasPrev(false));
        } else {
          setHasPrev(false); 
        }

        fetch(`/api/v1/animes/${animeId}/episodes/${epNumInt + 1}`, { cache: 'no-store' })
          .then(r => setHasNext(r.ok))
          .catch(() => setHasNext(false));

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchEpisode();
  }, [animeId, episodio]);

  const toggleFullScreen = async () => {
    const container = videoContainerRef.current;
    if (!container) return;

    if (isCssFullscreen) {
      setIsCssFullscreen(false);
      try {
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          screen.orientation.unlock();
        }
      } catch (e: unknown) {
        console.warn(e);
      }
      return;
    }

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else {
          setIsCssFullscreen(true);
        }

        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (orientation: string) => Promise<void>;
        };

        if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock('landscape').catch((err: unknown) => {
            console.warn("Orientación horizontal no soportada por el navegador:", err);
          });
        }
      } catch (err: unknown) {
        console.warn(`Fullscreen nativo bloqueado, usando modo CSS: ${err}`);
        setIsCssFullscreen(true);
      }
    } else {
      try {
        await document.exitFullscreen();
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          screen.orientation.unlock();
        }
      } catch (e: unknown) {
        console.warn(e);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-400 font-mono text-sm animate-pulse">
            Sincronizando episodio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !episodeData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#050505]">
        <div className="glass-panel p-6 text-center border border-red-500/20 max-w-md w-full">
          <h1 className="text-red-400 text-xl font-bold">
            Capítulo no encontrado
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            La ruta {animeId} / ep-{currentEpNum} no existe o fue eliminada.
          </p>
          <Link href={`/anime/${animeId}`}>
            <button className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold active:scale-95 transition-all w-full">
              Volver al Anime
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col w-full">
      {/* Estilos específicos para el modo pantalla completa */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :fullscreen {
          background-color: black;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `,
        }}
      />

      {/* NAVBAR */}
      <div className="px-3 sm:px-5 md:px-8 lg:px-12 pt-4">
        <Navbar />
      </div>

      {/* CONTENEDOR PRINCIPAL DEL REPRODUCTOR (Ancho Total) */}
      <div className="w-full px-3 sm:px-5 md:px-8 lg:px-12 flex flex-col mb-auto">
        
        <FadeUpSection>
          <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-[10px] md:text-xs font-black tracking-wider uppercase bg-purple-600/20 text-purple-400 rounded-md border border-purple-500/30 shadow-sm shrink-0">
                  Episodio {currentEpNum}
                </span>
                <span className="text-[10px] md:text-xs text-gray-400 font-mono opacity-80 truncate">
                  {tgUser ? `Viendo como ${tgUser}` : "Modo espectador"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter glow-text leading-tight text-white/90 truncate">
                {episodeData.title}
              </h1>
            </div>
            
            {/* Botón Volver al Anime */}
            <Link href={`/anime/${animeId}`} className="shrink-0">
              <button className="w-full md:w-auto px-5 py-2.5 glass-panel rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Volver al Anime</span>
              </button>
            </Link>
          </header>
        </FadeUpSection>

        <FadeUpSection delayMs={100}>
          {/* REPRODUCTOR DE VIDEO INMERSIVO (Ancho 100%) */}
          <div 
            ref={videoContainerRef} 
            className={`glass-panel overflow-hidden group bg-black transition-all duration-300 border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.1)] ${
              isCssFullscreen 
                ? "fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center rounded-none" 
                : "relative w-full aspect-video mb-8 rounded-xl md:rounded-2xl"
            }`}
          >
            <iframe
              src={episodeData.videoUrl}
              className="w-full h-full border-none"
              allow="fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
            
            <button 
              onClick={toggleFullScreen}
              className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 z-50 hover:bg-black/80 shadow-lg"
              title="Pantalla Completa"
            >
              {isCssFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </FadeUpSection>

        <FadeUpSection delayMs={200}>
          {/* CONTROLES ANTERIOR Y SIGUIENTE (Justificados) */}
          <div className="mb-10 flex flex-row justify-between gap-4 max-w-4xl mx-auto w-full">
            {hasPrev ? (
              <Link href={`/anime/${animeId}/ep-${currentEpNum - 1}`} className="flex-1">
                <button className="w-full glass-panel py-3.5 md:py-4 text-sm font-bold text-white hover:bg-white/10 border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Anterior
                </button>
              </Link>
            ) : (
              <button disabled className="flex-1 glass-panel py-3.5 md:py-4 text-sm font-semibold text-gray-600 cursor-not-allowed opacity-50 flex items-center justify-center gap-2 border-transparent rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Anterior
              </button>
            )}

            {hasNext ? (
              <Link href={`/anime/${animeId}/ep-${currentEpNum + 1}`} className="flex-1">
                <button className="w-full glass-panel py-3.5 md:py-4 text-sm font-bold text-blue-300 hover:bg-blue-600/20 border border-blue-500/40 active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 rounded-xl">
                  Siguiente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </Link>
            ) : (
              <button disabled className="flex-1 glass-panel py-3.5 md:py-4 text-sm font-semibold text-gray-600 cursor-not-allowed opacity-50 flex items-center justify-center gap-2 border-transparent rounded-xl">
                Siguiente
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </FadeUpSection>

        <FadeUpSection delayMs={300}>
          {/* SINOPSIS DEL EPISODIO */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl mb-8 border-white/5 max-w-5xl mx-auto w-full">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white/90">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full inline-block shadow-[0_0_10px_rgba(147,51,234,0.8)]"></span>
              Sinopsis del Episodio
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify">
              {episodeData.synopsis || "No hay sinopsis disponible para este episodio."}
            </p>
          </div>
        </FadeUpSection>

      </div>

      {/* FOOTER */}
      <div className="px-3 sm:px-5 md:px-8 lg:px-12 mt-auto">
        <Footer />
      </div>

    </main>
  );
}