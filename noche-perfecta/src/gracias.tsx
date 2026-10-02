import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import './index.css'
import { copy } from './data/copy.es'
import { Ancla, Ilustracion } from './components/ui'
import { asset } from './data/asset'

const PDF = asset('/guia/ritual-noche-perfecta-14-noches.pdf')

// Página de obrigado (pós-compra Hotmart): 1ª linha o PDF, 2ª linha o plano.
function Gracias() {
  const g = copy.gracias
  return (
    <main className="mx-auto min-h-[100dvh] max-w-md bg-noche-900 px-5 py-8">
      <header className="text-center">
        <Ilustracion name="portada" size={130} />
        <h1 className="mt-3 text-3xl font-extrabold text-crema">{g.titulo}</h1>
        <p className="mt-2 text-xl text-crema-soft">{g.texto}</p>
      </header>

      <section className="mt-6 rounded-3xl bg-noche-800 p-5" aria-labelledby="pdf">
        <h2 id="pdf" className="flex items-center gap-3 text-2xl font-extrabold text-crema">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ambar text-xl text-ambar-ink">1</span>
          {g.pdfTitulo}
        </h2>
        <p className="mt-3 text-lg text-crema-soft">{g.pdfTexto}</p>
        <a
          href={PDF}
          download="Protocolo-Ritual-Noche-Perfecta-14-noches.pdf"
          className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-ambar px-5 text-center text-xl font-bold text-ambar-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-crema"
        >
          ⬇️ {g.pdfBoton}
        </a>
      </section>

      <section className="mt-4 rounded-3xl bg-noche-800 p-5" aria-labelledby="plan">
        <h2 id="plan" className="flex items-center gap-3 text-2xl font-extrabold text-crema">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ambar text-xl text-ambar-ink">2</span>
          {g.planTitulo}
        </h2>
        <p className="mt-3 text-lg text-crema-soft">{g.planTexto}</p>
        <a
          href={asset('/')}
          className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-ambar bg-noche-900 px-5 text-xl font-bold text-crema focus:outline-none focus-visible:ring-4 focus-visible:ring-crema"
        >
          🌙 {g.planBoton} →
        </a>
      </section>

      <section className="mt-4 rounded-3xl bg-noche-800/70 p-5">
        <h2 className="text-xl font-bold text-crema">{g.instalarTitulo}</h2>
        <p className="mt-2 text-lg text-crema-soft">{g.instalarTexto}</p>
        <p className="mt-3 text-base text-crema-soft">{g.guardaLink}</p>
      </section>

      <div className="mt-6">
        <Ancla />
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gracias />
  </StrictMode>,
)
