import { describe, it, expect } from 'vitest'
import { chunk } from '../chunker'

describe('chunk', () => {
  it('returns single chunk for short text', () => {
    const chunks = chunk('note-1', 'Hello world')
    expect(chunks).toHaveLength(1)
    expect(chunks[0]?.text).toBe('Hello world')
    expect(chunks[0]?.noteId).toBe('note-1')
  })

  it('splits text longer than chunkSize', () => {
    const text = 'a'.repeat(600)
    const chunks = chunk('note-2', text, { chunkSize: 512, overlap: 64 })
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) {
      expect(c.noteId).toBe('note-2')
      expect(c.text.length).toBeLessThanOrEqual(512)
    }
  })

  it('includes overlap between consecutive chunks', () => {
    const text = 'a'.repeat(600)
    const chunks = chunk('note-3', text, { chunkSize: 512, overlap: 64 })
    const [first, second] = chunks
    if (!first || !second) throw new Error('Expected at least two chunks')
    // Second chunk starts at first.endOffset - overlap
    expect(second.startOffset).toBe(first.endOffset - 64)
  })

  it('assigns unique ids to each chunk', () => {
    const text = 'a'.repeat(1200)
    const chunks = chunk('note-4', text, { chunkSize: 512, overlap: 64 })
    const ids = new Set(chunks.map((c) => c.id))
    expect(ids.size).toBe(chunks.length)
  })
})
