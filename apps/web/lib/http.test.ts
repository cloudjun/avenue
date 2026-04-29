import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './http'

describe('getErrorMessage', () => {
  it('returns fallback when payload is null', () => {
    expect(getErrorMessage(null, 'Registration failed')).toBe('Registration failed')
  })

  it('returns fallback when payload message is missing', () => {
    expect(getErrorMessage({}, 'Registration failed')).toBe('Registration failed')
  })

  it('returns payload message when present', () => {
    expect(getErrorMessage({ message: 'Invalid credentials' }, 'Registration failed')).toBe(
      'Invalid credentials'
    )
  })
})
