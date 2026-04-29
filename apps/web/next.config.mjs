import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
}

const sentryOptions = {
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { project: process.env.SENTRY_PROJECT } : {}),
  ...(process.env.SENTRY_AUTH_TOKEN ? { authToken: process.env.SENTRY_AUTH_TOKEN } : {}),
}

export default withSentryConfig(nextConfig, sentryOptions)
