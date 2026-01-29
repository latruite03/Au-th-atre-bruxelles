import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
