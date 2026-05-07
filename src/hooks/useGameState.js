import { useState, useCallback, useEffect } from 'react'

const MAX_GUESSES = 6

function loadState(storageKey, key) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const state = JSON.parse(raw)
    if (state.key !== key) return null
    return state
  } catch {
    return null
  }
}

function saveState(storageKey, state) {
  localStorage.setItem(storageKey, JSON.stringify(state))
}

export function useGameState({ puzzle, storageKey, stateKey, onWin, onLoss, persist = true }) {
  const [guesses, setGuesses] = useState([])
  const [completed, setCompleted] = useState(false)
  const [won, setWon] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (persist) {
      const saved = loadState(storageKey, stateKey)
      if (saved) {
        setGuesses(saved.guesses)
        setCompleted(saved.completed)
        setWon(saved.won)
        setHintsRevealed(saved.guesses.filter(g => !g.correct).length)
      }
    }
    setInitialized(true)
  }, [storageKey, stateKey, persist])

  const submitGuess = useCallback((subredditName) => {
    if (completed || !puzzle) return

    const correct = subredditName.toLowerCase() === puzzle.answer.subreddit.toLowerCase()
    const newGuess = { name: subredditName, correct }
    const newGuesses = [...guesses, newGuess]
    const isWin = correct
    const isLoss = !correct && newGuesses.length >= MAX_GUESSES
    const isCompleted = isWin || isLoss

    setGuesses(newGuesses)
    if (!correct) setHintsRevealed(prev => prev + 1)
    if (isCompleted) {
      setCompleted(true)
      setWon(isWin)
      if (isWin) onWin?.(newGuesses.length)
      else onLoss?.()
    }

    if (persist) {
      saveState(storageKey, {
        key: stateKey,
        guesses: newGuesses,
        completed: isCompleted,
        won: isWin,
      })
    }
  }, [completed, puzzle, guesses, storageKey, stateKey, persist, onWin, onLoss])

  return {
    guesses,
    completed,
    won,
    hintsRevealed,
    submitGuess,
    maxGuesses: MAX_GUESSES,
    initialized,
  }
}
