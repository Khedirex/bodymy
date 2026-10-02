/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// RNP_BASE=/ritual/ publica o app dentro do BodyMy (app.bodymy.com.br/ritual).
const base = process.env.RNP_BASE ?? '/'
// O Next serve /ritual (sem barra): o escopo do service worker precisa cobrir
// "/ritual" também — o BodyMy envia Service-Worker-Allowed para isso.
const scope = base === '/' ? '/' : base.replace(/\/$/, '')

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      // Duas páginas: o app (/) e a página de obrigado da Hotmart (/gracias).
      input: { main: 'index.html', gracias: 'gracias.html' },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      scope,
      manifestFilename: 'manifest.webmanifest',
      includeAssets: ['icons/*.png', 'illustrations/*.webp'],
      manifest: {
        name: 'Ritual Noche Perfecta',
        short_name: 'Noche Perfecta',
        description: 'Tu protocolo de 14 noches con las Vibraciones Nocturnas.',
        lang: 'es',
        start_url: scope,
        scope,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0c0844',
        theme_color: '#0c0844',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,woff2}'],
        // Os áudios NÃO entram no precache (são grandes) nem passam pelo
        // service worker: o app guarda cada um no cache depois do primeiro
        // play e, nas próximas vezes, toca o arquivo completo do aparelho.
        globIgnores: ['audios/**', 'guia/**'],
        // /gracias é uma página própria: o SW não deve trocá-la pelo app.
        navigateFallbackDenylist: [/\/gracias/],
      },
    }),
  ],
  test: { environment: 'node' },
})
