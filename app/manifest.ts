import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VolsLift',
    short_name: 'VolsLift',
    description: 'Fast workout logger',
    start_url: '/log',
    display: 'standalone',
    background_color: '#0E0E0F',
    theme_color: '#0E0E0F',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
