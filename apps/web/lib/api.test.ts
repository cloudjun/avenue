import { afterEach, describe, expect, it, vi } from 'vitest'

describe('avenueApiUrl env resolution', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('prefers AVENUE_API_URL when present', async () => {
    vi.stubEnv('AVENUE_API_URL', 'https://server-only.example.com')
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://public.example.com')
    const { avenueApiUrl } = await import('./api')
    expect(avenueApiUrl('/auth/register')).toBe('https://server-only.example.com/auth/register')
  })

  it('falls back to NEXT_PUBLIC_API_BASE_URL', async () => {
    vi.stubEnv('AVENUE_API_URL', '')
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://public.example.com')
    const { avenueApiUrl } = await import('./api')
    expect(avenueApiUrl('/auth/register')).toBe('https://public.example.com/auth/register')
  })
})
