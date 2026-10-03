// =====================================================================
// Lápide do app estático antigo do Ritual Noche Perfecta (/ritual).
//
// O app foi portado para dentro do Next (/noche) e os arquivos saíram do
// repositório. Quem instalou o PWA antigo na tela do celular tem um service
// worker com escopo /ritual servindo tudo do cache: sem este arquivo, ela
// continuaria abrindo o app velho para sempre, sem nunca ver o novo.
//
// Este worker só faz três coisas: apaga os caches do workbox antigo, se
// desregistra e leva as abas abertas para /noche.
// =====================================================================

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Só os caches do app antigo (workbox). O cache do app principal
      // ('bodymy-static-v2') mora na mesma origem e NÃO pode ser apagado aqui.
      const nomes = await caches.keys()
      await Promise.all(
        nomes
          .filter((n) => n.includes('precache') || n.includes('runtime'))
          .map((n) => caches.delete(n)),
      )

      await self.registration.unregister()

      const abas = await self.clients.matchAll({ type: 'window' })
      for (const aba of abas) {
        try {
          await aba.navigate('/noche')
        } catch {
          /* a aba pode não permitir navegação programática */
        }
      }
    })(),
  )
})

// Nada é interceptado: tudo vai para a rede.
self.addEventListener('fetch', () => {})
