import { NextRequest, NextResponse } from 'next/server'
import { avenueApiUrl } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const response = await fetch(avenueApiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    cache: 'no-store',
  })

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  })
}
