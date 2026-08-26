import { clerkMiddleware } from "@clerk/nextjs/server";

// Esto simplemente inicializa Clerk en toda la app sin bloquear rutas a la fuerza.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Ignora archivos estáticos e internos de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Aplica a las rutas de API
    '/(api|trpc)(.*)',
  ],
};