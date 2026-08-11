export default function manifest() {
  return {
    name: 'Savoy Summerset Menu',
    short_name: 'Savoy Menu',
    description: 'Browse the Savoy Summerset restaurant menu and make a reservation, right from your home screen.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F8F8F8',
    theme_color: '#8B0000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/images/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/images/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/images/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/images/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
