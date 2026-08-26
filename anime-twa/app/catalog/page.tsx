"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Importamos la lista oficial
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
          const data = await res.json();
          setAnimes(data);
        }
      } catch (err) {
        console.error("Error cargando catálogo", err);
      } finally {
        setTimeout(() => setIsLoaded(true), 500);
      }
    };
    fetchAnimes();
  }, []);

  // LÓGICA DE FILTRADO 
  const filteredAnimes = animes.filter((anime) => {
    // Busca si el género seleccionado está INCLUIDO en el string de géneros de la base de datos
    const matchGenre = filterGenre ? anime.genre?.toLowerCase().includes(filterGenre.toLowerCase()) : true;
    const matchYear = filterYear ? anime.releaseYear?.toString() === filterYear : true;
    const matchSeason = filterSeason ? anime.season === filterSeason : true;
    const matchStatus = filterStatus ? anime.status === filterStatus : true;
    return matchGenre && matchYear && matchSeason && matchStatus;
  });

  // LÓGICA DE ORDENAMIENTO 
  if (sortOrder === "ASC") {
    filteredAnimes.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === "DESC") {
    filteredAnimes.sort((a, b) => b.title.localeCompare(a.title));
  }

  // Extraer Años Únicos Dinámicamente
  const uniqueYears = Array.from(new Set(animes.map(a => a.releaseYear).filter(Boolean))).sort((a, b) => Number(b) - Number(a));

  const limpiarFiltros = () => {
    setFilterGenre("");
    setFilterYear("");
    setFilterSeason("");
    setFilterStatus("");
    setSortOrder("");
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-5 overflow-x-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel { background: rgba(20, 20, 20, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .input-filter { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; outline: none; transition: border-color 0.3s ease; width: 100%;}
        .input-filter:focus { border-color: #3b82f6; }
        .glow-text { text-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
      `}} />

      <header className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-sm font-semibold">Volver al Inicio</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter glow-text mb-1">Catálogo Completo</h1>
        <p className="text-gray-400 text-sm">Explora, filtra y encuentra tu anime favorito.</p>
      </header>

      {/* BARRA DE FILTROS */}
      <div className="glass-panel p-4 rounded-xl mb-6 shadow-lg border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          
          <div className="flex flex-col col-span-2 md:col-span-1 lg:col-span-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 ml-1">Buscar por Género</label>
            <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="input-filter cursor-pointer">
              <option value="">Todos los géneros</option>
              {PREDEFINED_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 ml-1">Año</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input-filter cursor-pointer">
              <option value="">Todos</option>
              {uniqueYears.map(year => <option key={year} value={year?.toString()}>{year}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 ml-1">Temporada</label>
            <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="input-filter cursor-pointer">
              <option value="">Todas</option>
              <option value="Primavera">Primavera</option>
              <option value="Verano">Verano</option>
              <option value="Otoño">Otoño</option>
              <option value="Invierno">Invierno</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 ml-1">Estado</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-filter cursor-pointer">
              <option value="">Todos</option>
              <option value="EMISION">En Emisión</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 ml-1">Orden</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input-filter cursor-pointer">
              <option value="">Por defecto</option>
              <option value="ASC">A - Z</option>
              <option value="DESC">Z - A</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={limpiarFiltros} className="text-xs text-red-400 hover:text-red-300 font-bold tracking-wider uppercase flex items-center gap-1 transition-colors active:scale-95">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      {filteredAnimes.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 p-6 glass-panel rounded-xl mb-auto">
          No se encontraron animes con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-auto">
          {filteredAnimes.map((anime) => (
            <Link key={anime.id} href={`/anime/${anime.slug}`} className="block group">
              <div className="glass-panel rounded-xl overflow-hidden relative aspect-3/4 shadow-lg transition-transform duration-300 active:scale-95 bg-[#111]">
                {anime.coverUrl && (
                  <Image src={anime.coverUrl} alt={anime.title} fill unoptimized className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 ${anime.status === 'EMISION' ? 'text-green-400' : 'text-gray-300'}`}>
                    {anime.status === 'EMISION' ? 'EMISIÓN' : 'FINALIZADO'}
                  </span>
                  {anime.releaseYear && (
                    <span className="text-[9px] font-bold text-white bg-blue-600/80 px-2 py-0.5 rounded-md backdrop-blur-md shadow-md">
                      {anime.season} {anime.releaseYear}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 z-20">
                  <h2 className="text-sm font-bold leading-tight line-clamp-2 text-white shadow-black drop-shadow-md mb-1">
                    {anime.title}
                  </h2>
                  <p className="text-[9px] text-gray-300 truncate font-semibold">{anime.genre || "Animación"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="h-12 w-full"></div>
    </main>
  );
}