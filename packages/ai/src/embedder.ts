import OpenAI from 'openai'
import type { Chunk, EmbeddedChunk } from './types'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (_client) return _client
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is required')
  _client = new OpenAI({ apiKey })
  return _client
}

const MODEL = 'text-embedding-3-small'
const BATCH_SIZE = 2048

export async function embed(chunk: Chunk): Promise<EmbeddedChunk> {
  const [result] = await embedBatch([chunk])
  if (!result) throw new Error('Embedding returned no result')
  return result
}

export async function embedBatch(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  if (chunks.length === 0) return []
  const client = getClient()
  const results: EmbeddedChunk[] = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const response = await client.embeddings.create({
      model: MODEL,
      input: batch.map((c) => c.text),
      encoding_format: 'float',
    })
    results.push(
      ...batch.map((c, j) => ({
        ...c,
        embedding: response.data[j]?.embedding ?? [],
      }))
    )
  }

  return results
}

export async function embedText(text: string): Promise<number[]> {
  const client = getClient()
  const response = await client.embeddings.create({
    model: MODEL,
    input: [text],
    encoding_format: 'float',
  })
  return response.data[0]?.embedding ?? []
}
