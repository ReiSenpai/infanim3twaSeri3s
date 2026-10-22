"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    import("animejs").then((animeModule) => {
      type AnimeFn = (params: Record<string, unknown>) => void;
      type AnimeModuleType = { default?: AnimeFn };

      const anime = (animeModule as AnimeModuleType).default || animeModule;
      
      if (typeof anime === "function" && navRef.current) {
        (anime as AnimeFn)({
          targets: navRef.current,
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 1000,
          easing: "easeOutExpo",
        });
      }
    }).catch((err) => console.error("Error al cargar la animación:", err));
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header 
      ref={navRef}
      className="relative w-full mb-8 opacity-0"
    >
      <div className="flex flex-col w-full bg-[#0a0f1a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-4 md:px-8 py-3 transition-all duration-300">
        
        {/* Borde superior decorativo sutil */}
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        {/* BARRA SUPERIOR PRINCIPAL */}
        <div className="flex items-center justify-between w-full z-10">
          
          {/* SECCIÓN IZQUIERDA: Logo + Navegación */}
          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* LOGO */}
            <Link href="/" className="group flex items-center justify-center shrink-0" onClick={closeMenu}>
              <div className="relative w-44 h-16 md:w-56 md:h-20 group-hover:scale-105 transition-transform duration-300 origin-left">
                <Image 
                  src="/Somosinfanime.png" 
                  alt="Somos Infanime Logo" 
                  fill 
                  className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" 
                  priority
                />
              </div>
            </Link>

            {/* Separador Vertical (Oculto en móviles) */}
            <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

            {/* NAVEGACIÓN DESKTOP (A la izquierda) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <Link href="/">
                <button className="relative px-4 py-2 text-sm md:text-base font-bold text-gray-300 hover:text-white transition-colors group">
                  Inicio
                  {isActive("/") && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-blue-500 rounded-t-md shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                  )}
                </button>
              </Link>

              <Link href="/catalog">
                <button className="relative px-4 py-2 text-sm md:text-base font-bold text-gray-300 hover:text-white transition-colors group">
                  Catálogo
                  {isActive("/catalog") && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-purple-500 rounded-t-md shadow-[0_0_10px_rgba(147,51,234,0.8)]"></span>
                  )}
                </button>
              </Link>
            </nav>
          </div>

          {/* SECCIÓN DERECHA: Botones y Menú Móvil */}
          <div className="flex items-center gap-3">
            
            {/* BOTÓN TELEGRAM (Animado con SVG) - Visible solo en PC */}
            <div className="hidden lg:flex items-center z-10">
              <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer">
                <button className="group relative w-[140px] h-[44px] flex items-center justify-center bg-transparent border border-white/10 hover:bg-[#0088cc]/10 transition-colors duration-[1s] rounded-xl overflow-hidden focus:outline-none">
                  <svg className="absolute top-0 left-0 w-full h-full fill-none stroke-[#00aaff] stroke-[3px] [stroke-dasharray:100_268] [stroke-dashoffset:100] transition-all duration-[1s] ease-in-out group-hover:[stroke-dashoffset:-268]">
                    <rect x="0" y="0" width="100%" height="100%" rx="12" />
                  </svg>
                  <span className="relative z-10 flex items-center gap-2 text-sm font-bold text-gray-300 group-hover:text-white transition-colors duration-[1s]">
                    <svg className="w-4 h-4 text-[#00aaff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
                    Canal
                  </span>
                </button>
              </a>
            </div>

            {/* BOTÓN MENÚ HAMBURGUESA (Móvil) */}
            <button 
              className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none transition-transform active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg 
                className={`w-7 h-7 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-90 scale-90" : "rotate-0"}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        <div 
          className={`md:hidden grid transition-all duration-400 ease-in-out w-full ${
            isMobileMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
          }`}
        >
          <div className="overflow-hidden flex flex-col gap-2">
            <div className="w-full h-px bg-white/5 mb-2"></div>
            
            <Link href="/" onClick={closeMenu}>
              <div className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${
                isActive("/") ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
                Inicio
                {isActive("/") && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>}
              </div>
            </Link>

            <Link href="/catalog" onClick={closeMenu}>
              <div className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${
                isActive("/catalog") ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
                Catálogo
                {isActive("/catalog") && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(147,51,234,1)]"></span>}
              </div>
            </Link>

            <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="mt-2 mb-2">
              <button className="w-full px-4 py-3 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#00aaff] text-sm font-bold hover:bg-[#0088cc] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,136,204,0.4)]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
                Canal de Telegram
              </button>
            </a>
          </div>
        </div>

      </div>
    </header>
  );
}