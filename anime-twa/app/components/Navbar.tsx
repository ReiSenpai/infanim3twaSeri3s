"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import anime from "animejs";

const navLinks = [
  { name: "Inicio", path: "/" },
  { name: "Catálogo", path: "/catalog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const pillRef = useRef<HTMLDivElement | null>(null);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = navLinks.findIndex(
      (link) => pathname === link.path || (link.path !== "/" && pathname?.startsWith(link.path))
    );

    if (activeIndex !== -1 && navRefs.current[activeIndex] && pillRef.current) {
      const activeItem = navRefs.current[activeIndex]!;
      
      anime({
        targets: pillRef.current,
        translateX: activeItem.offsetLeft,
        width: activeItem.offsetWidth,
        duration: 500,
        easing: "easeOutElastic(1, 0.7)",
      });
    }
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#0f1423]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <header className="flex flex-col w-full px-4 md:px-8 py-3 transition-all duration-300">
        
        {/* BARRA PRINCIPAL */}
        <div className="flex items-center justify-between w-full">
          
          <Link 
            href="/" 
            className="shrink-0 bg-white/5 border border-white/10 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors z-20"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative w-7 h-7 md:w-8 md:h-8">
              <Image 
                src="/Somosinfanime.png" 
                alt="Somos Infanime Logo" 
                fill 
                className="object-contain drop-shadow-md" 
                priority
              />
            </div>
          </Link>

          {/* NAVEGACIÓN ESCRITORIO */}
          <nav className="hidden md:flex items-center relative z-10 bg-black/40 border border-white/10 rounded-full p-1">
            <div 
              ref={pillRef}
              className="absolute top-1 left-0 h-[calc(100%-8px)] bg-white rounded-full -z-10"
              style={{ width: 0 }} 
            />

            {navLinks.map((link, index) => {
              const isActive = pathname === link.path || (link.path !== "/" && pathname?.startsWith(link.path));

              return (
                <Link 
                  key={link.name} 
                  href={link.path}
                  ref={(el) => { navRefs.current[index] = el; }}
                  className={`relative px-6 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive ? "text-black" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CONTROLES DERECHA */}
          <div className="flex items-center gap-2 md:gap-4 z-20">
            <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
                Canal
              </button>
            </a>

            <button 
              className="md:hidden w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90 scale-90' : 'rotate-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MENÚ DESPLEGABLE MÓVIL */}
        <div 
          className={`md:hidden grid transition-all duration-300 ease-in-out w-full ${
            isMobileMenuOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
          }`}
        >
          <div className="overflow-hidden flex flex-col gap-1">
            <div className="w-full h-px bg-white/10 mb-2"></div>
            
            {navLinks.map((link) => {
              const isActive = pathname === link.path || (link.path !== "/" && pathname?.startsWith(link.path));
              return (
                <Link key={link.name} href={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <span className="font-semibold text-sm">{link.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>
                    )}
                  </div>
                </Link>
              );
            })}

            <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer" className="mt-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-full px-4 py-3 rounded-xl bg-[#0088cc] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#0077b5] transition-colors text-sm shadow-[0_4px_15px_rgba(0,136,204,0.4)]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
                Canal de Telegram
              </div>
            </a>
          </div>
        </div>

      </header>
    </div>
  );
}