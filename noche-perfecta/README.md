# Ritual Noche Perfecta — app

Versión práctica del protocolo de 14 noches (PDF) con los 7 audios
**Vibraciones Nocturnas** tocando en un player propio. Web app mobile-first,
en español neutro, **sin backend**: el progreso queda en el celular
(`localStorage`, clave `rnp_state_v1`) y se puede exportar/importar en JSON
desde **Más → Ajustes**.

Stack: Vite + React + TypeScript + Tailwind, PWA con `vite-plugin-pwa`.

## Comandos

```bash
npm install
npm run dev        # desarrollo
npm test           # tests del motor del protocolo (Vitest)
npm run build      # genera dist/ (deploy estático)
npm run preview    # sirve dist/ en local
```

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Reglas del protocolo (avance, Regla de las 2 noches, Severa, Rescate, noche perdida, mantenimiento, recaída) | `src/protocol/protocol.ts` + `protocol.test.ts` |
| **Todos los textos** de la interfaz | `src/data/copy.es.ts` |
| Los 7 audios (nombre, función, duración, archivo) | `src/data/audios.ts` |
| Archivos de audio | `public/audios/vn1.mp3` … `vn7.mp3` |
| Ilustraciones (extraídas del PDF) | `public/illustrations/` |
| Íconos del PWA | `public/icons/` |

## Cambiar un audio

1. Reemplaza el archivo en `public/audios/` **con el mismo nombre** (`vn1.mp3` … `vn7.mp3`).
2. Si cambió la duración, actualiza `duracionSeg` en `src/data/audios.ts`.
3. Haz deploy de nuevo.

Los audios actuales son los 7 que enviaste (01 Configuración del Sueño → VN1 …
07 Listo para soñar → VN7). En la app se muestran con los nombres del PDF
(VN1 · Apagado Mental, etc.).

## Funcionamiento sin internet

Los audios **no** se descargan al abrir la app (pesan ~7 MB cada uno). Cada
audio se guarda en el celular después del primer play y desde ahí suena sin
internet; en **Audios** aparece «Disponible sin internet».

## Modo prueba

Abre la app con `?debug=1` (ej.: `https://tu-url/?debug=1`). Aparece una
barra con botones para avanzar 12/24 h, completar noches (durmió / no durmió),
guardar bitácoras rápidas (buena o mala) y reiniciar — para probar las 14
noches, el mantenimiento y la recaída en minutos.

## Deploy (Vercel)

1. En Vercel: **Add New → Project** e importa el repositorio `Khedirex/bodymy`.
2. En **Root Directory** elige `noche-perfecta`.
3. Framework: **Vite** (Build `npm run build`, Output `dist`). Deploy.
4. Tendrás una URL tipo `https://ritual-noche-perfecta.vercel.app`.

(Netlify: base directory `noche-perfecta`, build `npm run build`, publish `dist`.)

## Dentro de la Hotmart

**Recomendado: link.** En el área de miembros, crea una clase con un botón o
enlace a la URL de la app, con el texto «Abrir mi Ritual». Así la persona
puede **instalarla en la pantalla de inicio** (PWA), el audio sigue sonando
con la pantalla apagada y el progreso queda guardado.

**Iframe (alternativa):** también funciona dentro de un iframe, pero en
iPhone el audio con pantalla bloqueada y el modo sin internet son menos
confiables dentro de un iframe, y no se puede instalar en la pantalla de inicio.

```html
<iframe src="https://TU-URL" style="width:100%;height:800px;border:0" allow="autoplay"></iframe>
```

## Pendiente de validar en celular real

El player se probó en navegador de escritorio (Chromium). Falta confirmar en
**iPhone (Safari)** y **Android (Chrome)**: audio con pantalla bloqueada,
controles en la pantalla de bloqueo (Media Session) y reproducción sin
internet después del primer play. En iPhone el volumen lo controla el
sistema, así que el fade-in/fade-out no aplica (el audio suena normal).
