import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (local cache)
      {
        protocol: 'https',
        hostname: 'orcuuknomvpzduiyrfpw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // External posters (option 1: hotlink)
      {
        protocol: 'https',
        hostname: 'www.theatreduparc.be',
        pathname: '/app/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'theatreduparc.be',
        pathname: '/app/uploads/**',
      },
      // Balsamine (WordPress CDN)
      {
        protocol: 'https',
        hostname: 'emasbg4opze.exactdn.com',
        pathname: '/wp-content/uploads/**',
      },
      // Espace Magh (WordPress)
      {
        protocol: 'https',
        hostname: 'www.espacemagh.be',
        pathname: '/wp-content/uploads/**',
      },
      // Les Riches-Claires (WordPress)
      {
        protocol: 'https',
        hostname: 'lesrichesclaires.be',
        pathname: '/wp-content/uploads/**',
      },
      // Ixelles / Mercelis (WordPress)
      {
        protocol: 'https',
        hostname: 'culture.ixelles.be',
        pathname: '/wp-content/uploads/**',
      },
      // CreaNova (Jimdo CDN)
      {
        protocol: 'https',
        hostname: 'image.jimcdn.com',
        pathname: '/**',
      },
      // Auditorium Jacques Brel (CERIA)
      {
        protocol: 'https',
        hostname: 'auditoriumjbrel.ceria.brussels',
        pathname: '/sites/default/files/**',
      },
      // Théâtre National
      {
        protocol: 'https',
        hostname: 'www.theatrenational.be',
        pathname: '/fr/image/**',
      },
      // Zinnema (Duda CDN)
      {
        protocol: 'https',
        hostname: 'irp.cdn-website.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lirp.cdn-website.com',
        pathname: '/**',
      },
      // KVS
      {
        protocol: 'https',
        hostname: 'www.kvs.be',
        pathname: '/media/cache/**',
      },
      // Théâtre Royal des Galeries (Odoo)
      {
        protocol: 'https',
        hostname: 'www.trg.be',
        pathname: '/web/image/**',
      },
      // Théâtre des Martyrs (WordPress)
      {
        protocol: 'https',
        hostname: 'theatre-martyrs.be',
        pathname: '/wp-content/uploads/**',
      },
      // Toone
      {
        protocol: 'https',
        hostname: 'www.toone.be',
        pathname: '/images/spectacles/**',
      },
      // Théâtre de Poche
      {
        protocol: 'https',
        hostname: 'poche.be',
        pathname: '/img/posters/**',
      },
      // Les Tanneurs
      {
        protocol: 'https',
        hostname: 'lestanneurs.be',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
