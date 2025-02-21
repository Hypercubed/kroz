import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'The Forgotten Adventures of Kroz',
        short_name: 'Kroz',
        description: 'The Forgotten Adventures of Kroz',
        start_url: '/kroz/',
        scope: '/kroz/',
        icons: [
          {
            src: '/kroz/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/kroz/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        theme_color: '#0000AA',
        background_color: '#000000',
        display: 'standalone'
      }
    })
  ]
});
