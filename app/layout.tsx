import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Théâtre Bruxelles - Spectacles ce soir",
  description: "Trouvez toutes les représentations théâtrales à Bruxelles",
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
