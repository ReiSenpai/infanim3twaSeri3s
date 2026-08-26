import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs"; // 👈 NUEVA IMPORTACIÓN DE CLERK
import "./globals.css"; // Asegúrate de tener Tailwind configurado aquí

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anime Web App",
  description: "Reproductor para Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 👇 ENVUELVE TU HTML CON EL PROVEEDOR DE CLERK
    <ClerkProvider>
      {/* Agregamos suppressHydrationWarning aquí 👇 */}
      <html lang="es" suppressHydrationWarning>
        <head>
          {/* Bloquea el zoom para dar sensación de app nativa */}
          <meta 
            name="viewport" 
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
          />
        </head>
        <body className={`${inter.className} bg-black text-white antialiased`}>
          
          {/* SDK de Telegram Web Apps */}
          <Script 
            src="https://telegram.org/js/telegram-web-app.js" 
            strategy="beforeInteractive" 
          />
          
          {children}
          
        </body>
      </html>
    </ClerkProvider>
  );
}