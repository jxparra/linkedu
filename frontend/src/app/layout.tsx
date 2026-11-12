import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "StudyHub",
  description: "Trabajos puntuales, foros por estudios y opiniones reales sobre carreras y universidades.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Pone el tema (claro u oscuro) antes de pintar, para que no parpadee */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${dmSans.variable} ${jakarta.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
