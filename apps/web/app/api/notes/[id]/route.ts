import { NextRequest, NextResponse } from 'next/server'
import { avenueApiUrl } from '@/lib/api'

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })

  const response = await fetch(avenueApiUrl(`/notes/${context.params.id}`), {
    method: 'DELETE',
    headers: { authorization: auth },
    cache: 'no-store',
  })

  return new NextResponse(null, { status: response.status })
}
