"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="glass-panel px-5 py-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 shadow-[0_8px_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
      
      {/* Borde superior decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500"></div>

      {/* IZQUIERDA: Logo y Subtítulo */}
      <Link href="/" className="flex flex-col items-center md:items-start z-10 group">
        <h1 className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-md group-hover:scale-[1.02] transition-transform origin-left">
          SOMOS <span className="text-blue-400 glow-text">INFANIME</span>
        </h1>
        <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">
          La mejor comunidad Anime
        </p>
      </Link>

      {/* DERECHA: Botones de Rutas */}
      <nav className="flex items-center gap-3 z-10 w-full md:w-auto justify-center md:justify-end border-t border-white/5 md:border-none pt-3 md:pt-0 mt-1 md:mt-0">
        
        {/* Botón Inicio */}
        <Link href="/">
          <button 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${
              pathname === "/" 
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/50" 
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Inicio
          </button>
        </Link>

        {/* Botón Catálogo */}
        <Link href="/catalogo">
          <button 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${
              pathname?.startsWith("/catalogo")
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-400/50" 
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            Catálogo
          </button>
        </Link>

      </nav>
    </header>
  );
}