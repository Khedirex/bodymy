/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Habilita instrumentation.ts (init do Sentry no servidor/edge).
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack(config) {
    // Silencia os avisos "Critical dependency" do @sentry/nextjs
    // (OpenTelemetry / require-in-the-middle usam require dinâmico). São
    // benignos e não afetam o runtime — só poluem o build.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@opentelemetry\/instrumentation/ },
      { module: /require-in-the-middle/ },
      { module: /@prisma\/instrumentation/ },
    ]
    return config
  },
  async headers() {
    return [
      {
        // Service worker must be served from the root scope with no long cache.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
