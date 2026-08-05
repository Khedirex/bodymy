// Gera os ícones PWA (PNG) sem dependências externas.
// Desenha um "coração/movimento" estilizado da marca BodyMy em coral.
// Rode: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function png(size, draw) {
  const px = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y)
      const i = (y * size + x) * 4
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      px[i + 3] = a
    }
  }
  // Adiciona filtro 0 por linha.
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const CORAL = [232, 137, 107]
const CREAM = [253, 251, 248]

// Desenho: fundo coral com um "coração" branco simples ao centro.
function heart(cx, cy, x, y, r) {
  const nx = (x - cx) / r
  const ny = (y - cy) / r
  // Curva de coração implícita.
  const v = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny
  return v <= 0
}

function makeIcon(size, { maskable } = {}) {
  const pad = maskable ? size * 0.12 : 0
  const cx = size / 2
  const cy = size * 0.46
  const r = size * 0.28
  return png(size, (x, y) => {
    // Fundo (canto arredondado se não maskable).
    const radius = size * 0.22
    const inside =
      maskable ||
      (Math.min(x, size - x) > 0 && Math.min(y, size - y) > 0 &&
        !inCorner(x, y, size, radius))
    if (!inside) return [0, 0, 0, 0]
    if (heart(cx, cy - ((y - cy) < 0 ? 0 : 0), x, y - size * 0.02, r)) {
      return [...CREAM, 255]
    }
    return [...CORAL, 255]
  })
}

function inCorner(x, y, size, radius) {
  const corners = [
    [radius, radius],
    [size - radius, radius],
    [radius, size - radius],
    [size - radius, size - radius],
  ]
  for (const [cx, cy] of corners) {
    const inX = (cx === radius && x < radius) || (cx !== radius && x > size - radius)
    const inY = (cy === radius && y < radius) || (cy !== radius && y > size - radius)
    if (inX && inY) {
      if (Math.hypot(x - cx, y - cy) > radius) return true
    }
  }
  return false
}

function save(path, buf) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, buf)
  console.log('✓', path, `(${buf.length} bytes)`)
}

save('public/icons/icon-192.png', makeIcon(192))
save('public/icons/icon-512.png', makeIcon(512))
save('public/icons/icon-maskable-512.png', makeIcon(512, { maskable: true }))
save('public/apple-touch-icon.png', makeIcon(180))
console.log('Ícones gerados.')
