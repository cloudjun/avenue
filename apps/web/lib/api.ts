export function avenueApiUrl(path: string): string {
  const baseUrl =
    process.env.AVENUE_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:4000'
  return `${baseUrl}${path}`
}
