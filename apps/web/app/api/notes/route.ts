import { NextRequest, NextResponse } from 'next/server'
import { avenueApiUrl } from '@/lib/api'

function authHeader(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  return header ? header : null
}

export async function GET(request: NextRequest) {
  const auth = authHeader(request)
  if (!auth) return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })

  const url = new URL(request.url)
  const backendUrl = avenueApiUrl(`/notes?limit=${url.searchParams.get('limit') ?? '50'}&offset=${url.searchParams.get('offset') ?? '0'}`)
  const response = await fetch(backendUrl, { headers: { authorization: auth }, cache: 'no-store' })
  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  })
}

export async function POST(request: NextRequest) {
  const auth = authHeader(request)
  if (!auth) return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })

  const body = await request.text()
  const response = await fetch(avenueApiUrl('/notes'), {
    method: 'POST',
    headers: {
      authorization: auth,
      'content-type': 'application/json',
    },
    body,
    cache: 'no-store',
  })

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  })
}
