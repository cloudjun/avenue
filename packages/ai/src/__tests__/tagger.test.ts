import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}))

const { tagNote } = await import('../tagger')

describe('tagNote', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    vi.clearAllMocks()
  })

  it('returns 3–5 lowercase tags from a valid JSON response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"tags": ["machine-learning", "python", "data-science"]}' }],
    })
    const tags = await tagNote('A note about training neural networks with Python.')
    expect(tags).toHaveLength(3)
    expect(tags).toContain('machine-learning')
    expect(tags.every((t) => t === t.toLowerCase())).toBe(true)
  })

  it('caps output at 5 tags', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"tags": ["a", "b", "c", "d", "e", "f", "g"]}',
        },
      ],
    })
    const tags = await tagNote('Long note with many topics.')
    expect(tags.length).toBeLessThanOrEqual(5)
  })

  it('returns empty array when JSON is malformed', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Not valid JSON at all' }],
    })
    const tags = await tagNote('Some note content.')
    expect(tags).toEqual([])
  })

  it('returns empty array when response has no text content', async () => {
    mockCreate.mockResolvedValueOnce({ content: [] })
    const tags = await tagNote('Some note.')
    expect(tags).toEqual([])
  })

  it('extracts JSON embedded in surrounding text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: 'Here are the tags: {"tags": ["cooking", "recipe"]}. Done.',
        },
      ],
    })
    const tags = await tagNote('A recipe for pasta.')
    expect(tags).toContain('cooking')
    expect(tags).toContain('recipe')
  })
})
