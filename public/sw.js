// BodyMy — Service Worker
// Estratégia:
//  * SOMENTE assets estáticos (JS/CSS do Next, ícones, manifest) são
//    cacheados. Cache-first para eles.
//  * NAVEGAÇÕES (documentos HTML) e conteúdo dinâmico/autenticado: SEMPRE
//    rede, NUNCA cache. Isso evita servir uma tela autenticada em cache de
//    uma sessão para outra e não interfere em cookies/sessão (importante
//    no PWA standalone, inclusive iOS).
const CACHE = 'bodymy-static-v2'

// Só assets realmente estáticos no precache (nunca uma página autenticada).
const PRECACHE = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}))
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
  // Só tratamos same-origin.
  if (url.origin !== self.location.origin) return

  // Assets estáticos versionados do Next + ícones + manifest → cache-first.
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

  // TUDO MAIS (navegações HTML, /api, /auth, dados de usuário): rede pura.
  // Não cacheamos nada disso — sessão/cookies e conteúdo privado sempre
  // frescos. Deixamos o navegador tratar (sem event.respondWith).
})
