// BodyMy — Service Worker (MVP)
// Estratégia:
//  * Shell/assets estáticos: cache-first com fallback à rede.
//  * Conteúdo dinâmico (aulas, dados do usuário, APIs): SEMPRE rede,
//    nunca cacheado no MVP (privacidade + frescor).
const CACHE = 'bodymy-shell-v1'
const SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Nunca cachear conteúdo dinâmico/privado.
  const isDynamic =
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/programa/') ||
    url.pathname.startsWith('/progresso') ||
    url.pathname.startsWith('/dieta') ||
    url.searchParams.has('token')

  if (isDynamic) {
    event.respondWith(fetch(request))
    return
  }

  // Assets estáticos do Next e ícones: cache-first.
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
            return res
          }),
      ),
    )
    return
  }

  // Navegações (documentos): rede primeiro, fallback ao shell offline.
  event.respondWith(
    fetch(request).catch(() => caches.match('/') ),
  )
})
