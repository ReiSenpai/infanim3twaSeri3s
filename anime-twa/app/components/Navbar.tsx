"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="glass-panel px-4 md:px-8 py-3 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/5 relative overflow-hidden">
      
      {/* Borde superior decorativo sutil (Opcional, puedes quitarlo si prefieres estilo 100% plano) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400 opacity-50"></div>

      {/* SECCIÓN IZQUIERDA: Logo y Navegación Principal */}
      <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto z-10">
        
        <Link href="/" className="group flex items-center justify-center shrink-0">
          {/* Logo mucho más grande, estilo AnimeYT */}
          <div className="relative w-44 h-16 md:w-56 md:h-20 group-hover:scale-105 transition-transform duration-300 origin-center md:origin-left">
            <Image 
              src="/Somosinfanime.png" 
              alt="Somos Infanime Logo" 
              fill 
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" 
              priority
            />
          </div>
        </Link>

        {/* Separador Vertical (Oculto en celulares, visible en PC) */}
        <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

        {/* Navegación (Estilo Texto con indicador inferior) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          
          <Link href="/">
            <button className="relative px-4 py-2 text-sm md:text-base font-bold text-gray-300 hover:text-white transition-colors group">
              Inicio
              {/* Indicador inferior brillante si está activo */}
              {pathname === "/" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-blue-500 rounded-t-md shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              )}
            </button>
          </Link>

          <Link href="/catalog">
            <button className="relative px-4 py-2 text-sm md:text-base font-bold text-gray-300 hover:text-white transition-colors group">
              Catálogo
              {pathname?.startsWith("/catalog") && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] bg-purple-500 rounded-t-md shadow-[0_0_10px_rgba(147,51,234,0.8)]"></span>
              )}
            </button>
          </Link>

        </nav>
      </div>

      {/* SECCIÓN DERECHA: Botones de Acción (Opcional, estilo AnimeYT) */}
      <div className="hidden lg:flex items-center gap-3 z-10">
        <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer">
          <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
            Canal
          </button>
        </a>
      </div>

    </header>
  );
}