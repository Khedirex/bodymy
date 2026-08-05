import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BodyMy',
  description: 'Seu programa de caminhada e bem-estar, no seu ritmo.',
  manifest: '/manifest.json',
  applicationName: 'BodyMy',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BodyMy',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#E8896B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body>
        <AnalyticsProvider>{children}</AnalyticsProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
