import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Au théâtre ce soir",
  description: "Calendrier des représentations — Région Bruxelles-Capitale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
