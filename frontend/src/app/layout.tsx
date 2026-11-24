import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

// Texto: Instrument Sans (sencilla y muy legible). Títulos: Bricolage Grotesque (con carácter, se reconoce de un vistazo)
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", axes: ["opsz", "wdth"] });

export const metadata: Metadata = {
  title: "Linkedu",
  description: "Trabajos puntuales, foros por estudios y opiniones reales sobre carreras y universidades.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${instrument.variable} ${bricolage.variable}`}>
      <head>
        {/* Pone el tema (claro u oscuro) antes de pintar, para que no parpadee */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
