import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is required')
  _client = new Anthropic({ apiKey })
  return _client
}

export async function tagNote(content: string): Promise<string[]> {
  const client = getClient()
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    system:
      'Generate 3 to 5 concise, lowercase tags for the given note. Respond with a JSON object only: {"tags": ["tag1", "tag2"]}. Tags must be single words or short hyphenated phrases.',
    messages: [{ role: 'user', content: content.slice(0, 2000) }],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return []
    const parsed = JSON.parse(jsonMatch[0]) as { tags?: unknown }
    if (!Array.isArray(parsed.tags)) return []
    return (parsed.tags as unknown[])
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5)
  } catch {
    return []
  }
}
