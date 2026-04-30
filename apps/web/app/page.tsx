'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getErrorMessage, parseJson } from '@/lib/http'

type Note = {
  id: string
  title: string | null
  content: string
  sourceUrl: string | null
  createdAt: string
}

type AuthResponse = {
  token: string
}

const TOKEN_KEY = 'avenue.auth.token.v1'
const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const existingToken = window.localStorage.getItem(TOKEN_KEY)
    if (existingToken) setToken(existingToken)
  }, [])

  useEffect(() => {
    if (!token) return
    void loadNotes(token)
  }, [token])

  const visibleNotes = useMemo(() => searchResults ?? notes, [notes, searchResults])

  const loadNotes = async (authToken: string) => {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/notes', {
        headers: { authorization: `Bearer ${authToken}` },
      })
      if (!response.ok) throw new Error('Failed to load notes')
      const data = (await parseJson(response)) as { notes: Note[] }
      setNotes(data.notes)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load notes')
    } finally {
      setBusy(false)
    }
  }

  const onRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await parseJson(response)) as AuthResponse | null
      if (!response.ok || !data || typeof data !== 'object' || !('token' in data)) {
        throw new Error(getErrorMessage(data, 'Registration failed'))
      }
      window.localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setPassword('')
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  const onGuestStart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = (await parseJson(response)) as AuthResponse | null
      if (!response.ok || !data || typeof data !== 'object' || !('token' in data)) {
        throw new Error(getErrorMessage(data, 'Guest login failed'))
      }
      window.localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUsername('')
    } catch (guestError) {
      setError(guestError instanceof Error ? guestError.message : 'Guest login failed')
    } finally {
      setBusy(false)
    }
  }

  const onCreateNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    if (!content.trim()) {
      setError('Note content is required')
      return
    }

    setBusy(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = { content, title: title || undefined }
      if (sourceUrl.trim()) payload.source_url = sourceUrl.trim()

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = (await parseJson(response)) as { note?: Note } | null
      if (!response.ok || !data || typeof data !== 'object' || !data.note) {
        throw new Error(getErrorMessage(data, 'Failed to save note'))
      }

      setNotes((prev) => [data.note as Note, ...prev])
      setTitle('')
      setContent('')
      setSourceUrl('')
      setSearchResults(null)
      setSearchQuery('')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to save note')
    } finally {
      setBusy(false)
    }
  }

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    setBusy(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/notes/search?q=${encodeURIComponent(searchQuery)}&mode=hybrid`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error('Search failed')
      const data = (await parseJson(response)) as { notes: Note[] }
      setSearchResults(data.notes)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!token) return
    setBusy(true)
    setError(null)

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete note')
      setNotes((prev) => prev.filter((note) => note.id !== id))
      setSearchResults((prev) => prev?.filter((note) => note.id !== id) ?? null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete note')
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setNotes([])
    setSearchResults(null)
  }

  return (
    <main className="page">
      <h1>Avenue</h1>
      <p className="subtitle">Functional MVP note workspace with hybrid search</p>

      {!token ? (
        <section className="panel">
          <h2>{AUTH_DISABLED ? 'Guest Session' : 'Start Session'}</h2>
          {AUTH_DISABLED ? (
            <form onSubmit={onGuestStart} className="stack">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                minLength={2}
              />
              <button type="submit" disabled={busy}>
                Continue as guest
              </button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="stack">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
              <button type="submit" disabled={busy}>
                Create account
              </button>
            </form>
          )}
        </section>
      ) : (
        <>
          <section className="panel row">
            <strong>{notes.length} notes</strong>
            <button onClick={logout}>Log out</button>
          </section>

          <section className="grid">
            <article className="panel">
              <h2>Create Note</h2>
              <form onSubmit={onCreateNote} className="stack">
                <input
                  placeholder="Title (optional)"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <input
                  placeholder="Source URL (optional)"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                />
                <textarea
                  placeholder="Write your note"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  required
                  rows={7}
                />
                <button type="submit" disabled={busy}>
                  Save note
                </button>
              </form>
            </article>

            <article className="panel">
              <h2>Search</h2>
              <form onSubmit={onSearch} className="row">
                <input
                  placeholder="Search notes (hybrid)"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button type="submit" disabled={busy}>
                  Search
                </button>
              </form>
              {searchResults ? (
                <button className="clear" onClick={() => setSearchResults(null)}>
                  Clear search
                </button>
              ) : null}
            </article>
          </section>

          <section className="panel">
            <h2>{searchResults ? 'Search Results' : 'All Notes'}</h2>
            <ul className="notes">
              {visibleNotes.map((note) => (
                <li key={note.id}>
                  <div className="row">
                    <strong>{note.title || 'Untitled'}</strong>
                    <button onClick={() => onDelete(note.id)}>Delete</button>
                  </div>
                  <p>{note.content}</p>
                  {note.sourceUrl ? <a href={note.sourceUrl}>{note.sourceUrl}</a> : null}
                </li>
              ))}
              {visibleNotes.length === 0 ? <li>No notes yet.</li> : null}
            </ul>
          </section>
        </>
      )}

      {error ? <p className="error">{error}</p> : null}

      <style jsx>{`
        .page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .subtitle { color: #4c5568; }
        .panel {
          border: 1px solid #d6dce6;
          border-radius: 14px;
          padding: 1rem;
          background: #fff;
          margin-top: 1rem;
        }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .stack { display: grid; gap: 0.7rem; }
        .row { display: flex; gap: 0.6rem; align-items: center; justify-content: space-between; }
        input, textarea {
          width: 100%;
          border: 1px solid #c7cfdd;
          border-radius: 10px;
          padding: 0.6rem 0.7rem;
          font: inherit;
        }
        button {
          border: none;
          border-radius: 999px;
          padding: 0.5rem 0.9rem;
          background: #204c7c;
          color: #fff;
          cursor: pointer;
        }
        .clear {
          margin-top: 0.75rem;
          background: #e7edf7;
          color: #21334d;
        }
        .notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
        .notes li { border: 1px solid #d6dce6; border-radius: 12px; padding: 0.75rem; }
        .notes p { white-space: pre-wrap; }
        .error { color: #a1172f; margin-top: 1rem; }
        @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  )
}
