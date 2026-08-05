'use client'

import posthog from 'posthog-js'
import { env } from '@/lib/env'

// =====================================================================
// Instrumentação de produto: PostHog (eventos) + Meta Pixel (ads).
// Tudo é no-op se as chaves não estiverem configuradas — o app funciona
// sem analytics em dev.
// =====================================================================

let posthogReady = false

export function initPostHog() {
  if (posthogReady || typeof window === 'undefined') return
  if (!env.posthogKey) return
  posthog.init(env.posthogKey, {
    api_host: env.posthogHost,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  })
  posthogReady = true
}

export function identify(userId: string, props?: Record<string, unknown>) {
  if (!env.posthogKey) return
  posthog.identify(userId, props)
}

export function track(event: string, props?: Record<string, unknown>) {
  if (env.posthogKey) posthog.capture(event, props)
}

// -------------------- Meta Pixel --------------------
type FbqFn = (...args: unknown[]) => void
declare global {
  interface Window {
    fbq?: FbqFn
    _fbqLoaded?: boolean
  }
}

export function pixelTrack(
  event: 'ViewContent' | 'InitiateCheckout',
  props?: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return
  if (!env.metaPixelId) return
  window.fbq?.('track', event, props)
}

// Eventos de negócio nomeados — usados nas telas de paywall.
export const analytics = {
  paywallView(productSlug: string) {
    track('paywall_view', { produto: productSlug })
    pixelTrack('ViewContent', { content_name: productSlug, content_type: 'product' })
  },
  paywallClick(productSlug: string, preco?: string) {
    track('paywall_click', { produto: productSlug, preco })
    pixelTrack('InitiateCheckout', { content_name: productSlug, content_type: 'product' })
  },
  lessonCompleted(lessonId: string, programSlug: string) {
    track('lesson_completed', { lesson_id: lessonId, programa: programSlug })
  },
  checkin(tipo: string) {
    track('checkin', { tipo })
  },
  onboardingCompleted() {
    track('onboarding_completed')
  },
}
