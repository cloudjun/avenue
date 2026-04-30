function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value)
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function avenueApiUrl(path: string): string {
  const serverBaseUrl = process.env.AVENUE_API_URL?.trim() ?? ''
  const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? ''

  const baseUrl = isAbsoluteHttpUrl(serverBaseUrl)
    ? serverBaseUrl
    : isAbsoluteHttpUrl(publicBaseUrl)
      ? publicBaseUrl
      : 'http://localhost:4000'

  return `${trimTrailingSlash(baseUrl)}${path}`
}
