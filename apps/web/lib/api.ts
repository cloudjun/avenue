const API_BASE_URL = process.env.AVENUE_API_URL ?? 'http://localhost:4000'

export function avenueApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
