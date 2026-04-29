import { randomUUID } from 'crypto'
import type { Chunk } from './types'

const DEFAULT_CHUNK_SIZE = 512
const DEFAULT_OVERLAP = 64

export function chunk(
  noteId: string,
  text: string,
  options: { chunkSize?: number; overlap?: number } = {}
): Chunk[] {
  const { chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP } = options
  const chunks: Chunk[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push({
      id: randomUUID(),
      noteId,
      text: text.slice(start, end),
      startOffset: start,
      endOffset: end,
    })
    if (end === text.length) break
    start = end - overlap
  }

  return chunks
}
