// components/Footer.tsx
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 mb-8 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-6 w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-32 h-16">
          <Image 
            src="/Somosinf.png" 
            alt="Somos Infanime Logo" 
            fill 
            className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
          />
        </div>
        <p className="text-gray-500 text-sm font-bold tracking-widest">
          © 2026 SOMOSINFANIME
        </p>
      </div>

      <div className="flex gap-4 mt-2">
        <a href="https://t.me/SomosInfanimeTV" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.15)]" title="Canal Principal">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
        </a>
        <a href="https://t.me/DirectorioInfanimeOfc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)]" title="Directorio Infanime">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.04-2.76-.89c-.6-.188-.612-.6.126-.89l10.814-4.17c.5-.196.953.116.85.871z"/></svg>
        </a>
        <a href="https://linktr.ee/SomosInfanime" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.15)]" title="Nuestras Redes (Linktree)">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.736 12.355l4.316-4.315-1.554-1.554-4.316 4.315V0h-2.196v10.801L5.67 6.486 4.116 8.04l4.315 4.315H0v2.196h8.431l-4.148 4.147 1.554 1.554 4.148-4.148v6.079h2.196v-6.079l4.148 4.148 1.554-1.554-4.148-4.147H24v-2.196h-8.431z"/></svg>
        </a>
      </div>
    </footer>
  );
}