import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cascais — Travel Discovery',
    short_name: 'Cascais',
    description: 'Ontdek Cascais als een local.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F6F4',
    theme_color: '#F7F6F4',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-apple.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
