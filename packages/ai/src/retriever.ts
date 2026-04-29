import type { EmbeddedChunk, RetrievalResult } from './types'

// Cosine similarity — used for in-memory / test retrieval.
// Production path uses pgvector's <=> operator directly in SQL.
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vector dimension mismatch')
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0)
    normA += (a[i] ?? 0) ** 2
    normB += (b[i] ?? 0) ** 2
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function retrieve(
  query: number[],
  corpus: EmbeddedChunk[],
  topK = 5
): RetrievalResult[] {
  return corpus
    .map((chunk) => ({ chunk, score: cosineSimilarity(query, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
