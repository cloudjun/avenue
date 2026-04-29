import { describe, it, expect } from 'vitest'
import { retrieve } from '../retriever'
import type { EmbeddedChunk } from '../types'

function makeChunk(id: string, embedding: number[]): EmbeddedChunk {
  return { id, noteId: 'n', text: '', startOffset: 0, endOffset: 0, embedding }
}

describe('retrieve', () => {
  it('returns top-K results by cosine similarity', () => {
    const corpus: EmbeddedChunk[] = [
      makeChunk('a', [1, 0, 0]),
      makeChunk('b', [0, 1, 0]),
      makeChunk('c', [0, 0, 1]),
    ]
    const query = [1, 0, 0]
    const results = retrieve(query, corpus, 2)
    expect(results).toHaveLength(2)
    expect(results[0]?.chunk.id).toBe('a')
    expect(results[0]?.score).toBeCloseTo(1)
  })

  it('handles empty corpus', () => {
    expect(retrieve([1, 0], [], 5)).toHaveLength(0)
  })

  it('returns at most topK results', () => {
    const corpus = Array.from({ length: 10 }, (_, i) =>
      makeChunk(`c${i}`, [i, 0])
    )
    expect(retrieve([1, 0], corpus, 3)).toHaveLength(3)
  })
})
