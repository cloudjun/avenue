import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avenue — Your 2nd Brain',
  description: 'AI-powered note-taking that learns and recalls for you.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
