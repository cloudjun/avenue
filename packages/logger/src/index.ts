import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, ignore: 'pid,hostname' },
        },
      }
    : {}),
  base: {
    service: process.env.SERVICE_NAME ?? 'avenue',
    env: process.env.NODE_ENV ?? 'development',
  },
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
})

export type Logger = typeof logger

export function childLogger(context: Record<string, unknown>) {
  return logger.child(context)
}
