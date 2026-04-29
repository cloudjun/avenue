import Anthropic from '@anthropic-ai/sdk'
import type { Chunk, EmbeddedChunk } from './types'

let _client: Anthropic | null = null

function getClient() {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is required')
  _client = new Anthropic({ apiKey })
  return _client
}

// Voyage embeddings via Anthropic's batch-friendly approach
// Using claude-3-haiku for now; swap to a dedicated embedding model when available
const BATCH_SIZE = 96

export async function embed(chunk: Chunk): Promise<EmbeddedChunk> {
  const [result] = await embedBatch([chunk])
  if (!result) throw new Error('Embedding returned no result')
  return result
}

export async function embedBatch(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  const client = getClient()
  const results: EmbeddedChunk[] = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: batch.map((c) => c.text).join('\n---\n') }],
    })

    // Placeholder: real embedding calls will use a dedicated vector model
    // This scaffold wires the interface; swap implementation when Anthropic ships embeddings
    void response
    results.push(...batch.map((c) => ({ ...c, embedding: [] as number[] })))
  }

  return results
}
