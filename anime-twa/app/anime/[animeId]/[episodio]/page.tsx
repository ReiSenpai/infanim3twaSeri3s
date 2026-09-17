"use client";

import { useEffect, useState, useRef, ReactNode, use } from "react";
import Link from "next/link";

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

        // 🔥 CORRECCIÓN: Le decimos a Next.js que NO guarde caché
        const res = await fetch(`/api/v1/animes/${animeId}/episodes/${epNumInt}`, { 
          cache: 'no-store' 
        });

        if (!res.ok) {
          throw new Error("Episodio no encontrado en la base de datos");
        }

        const data = await res.json();

        setEpisodeData({
          title: data.animeTitle || data.title, // Aseguramos tomar el título correcto
          videoUrl: data.videoUrl,
          synopsis: data.synopsis,
        });
        
        if (epNumInt > 1) {
          // 🔥 CORRECCIÓN: Evitamos caché en la verificación de "Anterior"
          fetch(`/api/v1/animes/${animeId}/episodes/${epNumInt - 1}`, { cache: 'no-store' })
            .then(r => setHasPrev(r.ok))
            .catch(() => setHasPrev(false));
        } else {
          setHasPrev(false); 
        }

        // 🔥 CORRECCIÓN: Evitamos caché en la verificación de "Siguiente"
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
        <div className="glass-panel p-6 text-center border border-red-500/20">
          <h1 className="text-red-400 text-xl font-bold">
            Capítulo no encontrado
          </h1>
          <p className="text-gray-400 mt-2">
            La ruta {animeId} / ep-{currentEpNum} no existe o fue eliminada.
          </p>
          <Link href="/">
            <button className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg font-semibold active:scale-95 transition-transform">
              Volver al Inicio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 overflow-x-hidden relative flex flex-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .glass-panel {
          background: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        .glow-text {
          text-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
        }
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

      <FadeUpSection>
        <header className="mb-6 mt-2 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-semibold">Catálogo Principal</span>
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="px-4 py-1.5 text-sm font-black bg-purple-600 text-white rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.5)] border border-purple-400/50">
              EPISODIO {currentEpNum}
            </span>
            <span className="text-xs text-blue-400 font-mono opacity-80">
              {tgUser ? `Viendo como ${tgUser}` : "Modo espectador"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tighter glow-text leading-tight text-white/90">
            {episodeData.title}
          </h1>
          
          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
              HD 1080p
            </span>
            <span className="px-3 py-1 text-xs font-semibold bg-gray-500/10 text-gray-300 rounded-full border border-gray-500/20">
              Sub Español
            </span>
          </div>
        </header>
      </FadeUpSection>

      <FadeUpSection>
        <div 
          ref={videoContainerRef} 
          className={`glass-panel overflow-hidden group shadow-2xl bg-black transition-all duration-300 ${
            isCssFullscreen 
              ? "fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center rounded-none" 
              : "relative w-full aspect-video mb-6"
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
            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 z-50"
            title="Pantalla Completa"
          >
            {isCssFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </FadeUpSection>

      <FadeUpSection>
        <div className="mb-6 flex justify-between gap-3">
          {hasPrev ? (
            <Link href={`/anime/${animeId}/ep-${currentEpNum - 1}`} className="flex-1">
              <button className="w-full glass-panel py-3.5 text-sm font-semibold text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Anterior
              </button>
            </Link>
          ) : (
            <button disabled className="flex-1 glass-panel py-3.5 text-sm font-semibold text-gray-600 cursor-not-allowed opacity-50 flex items-center justify-center gap-2 border-transparent">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Anterior
            </button>
          )}

          {hasNext ? (
            <Link href={`/anime/${animeId}/ep-${currentEpNum + 1}`} className="flex-1">
              <button className="w-full glass-panel py-3.5 text-sm font-bold text-blue-300 hover:bg-blue-600/20 border border-blue-500/40 active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2">
                Siguiente
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </Link>
          ) : (
            <button disabled className="flex-1 glass-panel py-3.5 text-sm font-semibold text-gray-600 cursor-not-allowed opacity-50 flex items-center justify-center gap-2 border-transparent">
              Siguiente
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </FadeUpSection>

      <FadeUpSection>
        <div className="glass-panel p-5 mb-auto">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-white/90">
            <span className="w-1 h-5 bg-purple-500 rounded-full inline-block shadow-[0_0_10px_rgba(147,51,234,0.8)]"></span>
            Sinopsis
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed text-justify">
            {episodeData.synopsis}
          </p>
        </div>
      </FadeUpSection>

      <FadeUpSection delayMs={300}>
        <footer className="mt-12 mb-8 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase">Únete a nuestra comunidad</p>
          <div className="flex gap-4">
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