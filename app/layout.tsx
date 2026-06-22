import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Flappy Bird — Juego web",
  description:
    "Un juego arcade donde esquivas tuberías y acumulas puntos. Juega gratis en el navegador.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#juego" className="sr-only" style={{ position: "absolute", left: -9999 }}>
          Saltar al juego
        </a>
        {children}
      </body>
    </html>
  );
}
