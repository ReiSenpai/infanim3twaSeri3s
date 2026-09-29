// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <Link href="/" className="block w-full">
      <header className="glass-panel px-5 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-[0_8px_30px_rgba(59,130,246,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] transition-shadow">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500"></div>
        <div className="flex flex-col z-10">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-md">
            SOMOS <span className="text-blue-400 glow-text">INFANIME</span>
          </h1>
          <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">
            La mejor comunidad Anime
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner z-10 shrink-0 group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </header>
    </Link>
  );
}