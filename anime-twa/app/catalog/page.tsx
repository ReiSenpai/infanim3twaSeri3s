"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// 🔥 1. Importamos los componentes globales
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PREDEFINED_GENRES = [
  "Acción", "Aventura", "Autos", "Comedia", "Drama", "Romance", "Ecchi", 
  "Fantasía", "Juegos", "Terror", "Isekai", "Música", "Samurai", "Escolar", 
  "Shoujo", "Deporte", "Yaoi", "Yuri", "Harem", "Recuentos de vida", 
  "Sobrenatural", "Militar", "Seinen", "Sci-Fi"
].sort();

interface Anime {
  id: number;
  slug: string;
  title: string;
  status: string;
  coverUrl: string;
  genre?: string;
  releaseYear?: number;
  season?: string;
}

export default function CatalogPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);

  // ESTADOS DE FILTROS
  const [filterGenre, setFilterGenre] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }

    const fetchAnimes = async () => {
      try {
        const res = await fetch("/api/v1/admin/animes");
        if (res.ok) {
          const data: Anime[] = await res.json();
          // Ordenamos por defecto del más reciente al más antiguo al cargar
          setAnimes(data.reverse());
        }
      } catch (err) {
        console.error("Error cargando catálogo", err);
      } finally {
        setTimeout(() => setIsLoaded(true), 500);
      }
    };
    fetchAnimes();
  }, []);

  const filteredAnimes = animes.filter((anime) => {
    const matchGenre = filterGenre ? anime.genre?.toLowerCase().includes(filterGenre.toLowerCase()) : true;
    const matchYear = filterYear ? anime.releaseYear?.toString() === filterYear : true;
    const matchSeason = filterSeason ? anime.season === filterSeason : true;
    const matchStatus = filterStatus ? anime.status === filterStatus : true;
    return matchGenre && matchYear && matchSeason && matchStatus;
  });

  if (sortOrder === "ASC") {
    filteredAnimes.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === "DESC") {
    filteredAnimes.sort((a, b) => b.title.localeCompare(a.title));
  }

  const uniqueYears = Array.from(new Set(animes.map(a => a.releaseYear).filter(Boolean))).sort((a, b) => Number(b) - Number(a));

  const limpiarFiltros = () => {
    setFilterGenre(""); setFilterYear(""); setFilterSeason(""); setFilterStatus(""); setSortOrder("");
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden flex flex-col w-full">
      
      {/* NAVBAR */}
      <div className="px-5 pt-4 md:px-10 lg:px-16 xl:px-24">
        <Navbar />
      </div>

      <div className="w-full px-5 md:px-10 lg:px-16 xl:px-24 flex flex-col mb-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter glow-text mb-1">Catálogo Completo</h1>
            <p className="text-gray-400 text-sm">Explora, filtra y encuentra tu anime favorito.</p>
          </div>
          <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 shadow-sm">
            {filteredAnimes.length} animes encontrados
          </span>
        </header>

        {/* BARRA DE FILTROS ESTILIZADA */}
        <div className="glass-panel p-5 rounded-2xl mb-8 shadow-lg border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="flex flex-col col-span-2 md:col-span-1 lg:col-span-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 ml-1">Buscar por Género</label>
              <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="bg-black/50 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 outline-none w-full transition-colors cursor-pointer">
                <option value="">Todos los géneros</option>
                {PREDEFINED_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 ml-1">Año</label>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-black/50 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 outline-none w-full transition-colors cursor-pointer">
                <option value="">Todos</option>
                {uniqueYears.map(year => <option key={year} value={year?.toString()}>{year}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 ml-1">Temporada</label>
              <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="bg-black/50 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 outline-none w-full transition-colors cursor-pointer">
                <option value="">Todas</option>
                <option value="Primavera">Primavera</option>
                <option value="Verano">Verano</option>
                <option value="Otoño">Otoño</option>
                <option value="Invierno">Invierno</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 ml-1">Estado</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-black/50 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 outline-none w-full transition-colors cursor-pointer">
                <option value="">Todos</option>
                <option value="EMISION">En Emisión</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 ml-1">Orden</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-black/50 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 outline-none w-full transition-colors cursor-pointer">
                <option value="">Por defecto</option>
                <option value="ASC">A - Z</option>
                <option value="DESC">Z - A</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={limpiarFiltros} className="text-xs text-red-400 hover:text-red-300 font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors active:scale-95 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* RESULTADOS (GRILLA FLUIDA) */}
        {filteredAnimes.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 py-16 glass-panel rounded-2xl border-dashed border-white/10">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-lg font-semibold text-white/80">No se encontraron resultados.</p>
            <p className="text-sm mt-1">Intenta ajustando o limpiando los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5 pb-8">
            {filteredAnimes.map((anime) => (
              <Link key={anime.id} href={`/anime/${anime.slug}`} className="block group w-full">
                <div className="glass-panel rounded-xl overflow-hidden relative aspect-[3/4] shadow-lg transition-transform duration-300 active:scale-95 bg-black border-white/5 hover:border-white/20">
                  {anime.coverUrl && (
                    <Image src={anime.coverUrl} alt={anime.title} fill unoptimized className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end z-20">
                    <span className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 ${anime.status === 'EMISION' ? 'text-red-400' : 'text-gray-300'}`}>
                      {anime.status === 'EMISION' ? 'EMISIÓN' : 'FINALIZADO'}
                    </span>
                    {anime.releaseYear && (
                      <span className="text-[9px] font-bold text-white bg-blue-600/90 px-2 py-1 rounded-md backdrop-blur-md shadow-md border border-blue-400/30">
                        {anime.season} {anime.releaseYear}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 z-20">
                    <h2 className="text-sm md:text-base font-bold leading-tight line-clamp-2 text-white shadow-black drop-shadow-md mb-1 group-hover:text-blue-300 transition-colors">
                      {anime.title}
                    </h2>
                    <p className="text-[10px] text-blue-400/80 truncate font-semibold">{anime.genre || "Animación"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* FOOTER */}
      <div className="px-5 md:px-10 lg:px-16 xl:px-24">
        <Footer />
      </div>
    </main>
  );
}