import { NextRequest, NextResponse } from 'next/server'
import { avenueApiUrl } from '@/lib/api'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })

  const url = new URL(request.url)
  const q = url.searchParams.get('q')
  const mode = url.searchParams.get('mode') ?? 'hybrid'

  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

  const response = await fetch(
    avenueApiUrl(`/notes/search?q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}&limit=10`),
    {
      headers: { authorization: auth },
      cache: 'no-store',
    }
  )

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  })
}
