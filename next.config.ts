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
    ],
  },
};

export default nextConfig;
