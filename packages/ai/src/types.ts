export interface Chunk {
  id: string
  noteId: string
  text: string
  startOffset: number
  endOffset: number
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[]
}

export interface RetrievalResult {
  chunk: EmbeddedChunk
  score: number
}
