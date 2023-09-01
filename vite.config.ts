import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { VitePWA } from 'vite-plugin-pwa'

import { webfontDownload } from 'vite-plugin-webfont-dl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    webfontDownload(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,woff2}',
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.myanimelist\.net\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mal-images',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              fetchOptions: {
                mode: 'cors',
                credentials: 'omit',
              },
            },
          },
          {
            urlPattern: /^(https:\/\/aclvt\.tchm\.dev|http:\/\/localhost:5173)\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'aclvt-api',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                purgeOnQuotaError: false,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // {
          //   urlPattern: /^https:\/\/nl\.catbox\.video\/.*/i,
          //   handler: 'CacheFirst',
          //   options: {
          //     cacheName: 'catbox',
          //     expiration: {
          //       maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          //       purgeOnQuotaError: true,
          //     },
          //     cacheableResponse: {
          //       statuses: [0, 200],
          //     },
          //     fetchOptions: {
          //       mode: 'cors',
          //       credentials: 'omit',
          //     },
          //   },
          // },
        ],
      },
      manifest: {
        name: "AMQ ACLVTQ",
        short_name: "ACLVTQ",
        start_url: "/",
        display: "standalone",
        background_color: "#000",
        description: "Browse the ACLVTQ list for AMQ rooms.",
        theme_color: "#006080",
        icons: [
            {
                src: "favicon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "maskable"
            },
            {
                src: "logo.png",
                sizes: "256x256",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "favicon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any"
            },
            {
                src: "logo.png",
                sizes: "256x256",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "logo-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
