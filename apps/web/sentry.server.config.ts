import * as Sentry from '@sentry/nextjs'

Sentry.init({
  ...(process.env.NEXT_PUBLIC_SENTRY_DSN
    ? { dsn: process.env.NEXT_PUBLIC_SENTRY_DSN }
    : {}),
  environment: process.env.NEXT_PUBLIC_ENV ?? 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  debug: false,
})
