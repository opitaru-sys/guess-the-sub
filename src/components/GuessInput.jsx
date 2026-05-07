import { useState, useRef, useEffect } from 'react'
import subreddits from '../data/autocomplete.json'

export default function GuessInput({ onGuess, disabled, guessedNames }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const filtered = query.length > 0
    ? subreddits.filter(s => {
        const q = query.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.display.toLowerCase().includes(q)
        )
      }).slice(0, 8)
    : []

  useEffect(() => {
    setHighlightIndex(-1)
  }, [query])

  useEffect(() => {
    if (highlightIndex >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.children[highlightIndex]
      if (el) el.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  function handleSelect(sub) {
    if (guessedNames.has(sub.name.toLowerCase())) {
      setError('Already guessed!')
      setQuery('')
      setShowDropdown(false)
      setTimeout(() => setError(''), 2000)
      return
    }
    onGuess(sub.name)
    setQuery('')
    setShowDropdown(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (highlightIndex >= 0 && filtered[highlightIndex]) {
      handleSelect(filtered[highlightIndex])
      return
    }
    const match = subreddits.find(
      s => s.name.toLowerCase() === query.toLowerCase()
    )
    if (match) {
      handleSelect(match)
    } else {
      setError('Not in our list. Pick from the dropdown.')
      setTimeout(() => setError(''), 2500)
    }
  }

  function handleKeyDown(e) {
    if (!showDropdown || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, 0))
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">
            r/
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setShowDropdown(true)
              setError('')
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="type a subreddit name..."
            className="w-full bg-bg-surface border border-border rounded-lg pl-8 pr-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50"
          />
          {showDropdown && filtered.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 left-0 right-0 mt-1 bg-bg-elevated border border-border rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto"
            >
              {filtered.map((sub, i) => (
                <button
                  key={sub.name}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(sub) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    i === highlightIndex
                      ? 'bg-accent/20 text-accent'
                      : 'text-text-primary hover:bg-bg-surface'
                  }`}
                >
                  {sub.display}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Guess
        </button>
      </form>
      {error && (
        <p className="text-wrong text-sm mt-2 animate-shake">{error}</p>
      )}
    </div>
  )
}
