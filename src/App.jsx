import { useState, useEffect } from 'react'
import { getTodayUTC } from './utils/dateUtils'
import GameBoard from './components/GameBoard'
import WelcomeModal from './components/WelcomeModal'
import AdminPage from './components/AdminPage'

const VISITED_KEY = 'guessTheSub_visited'

export default function App() {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  if (isAdmin) return <AdminPage />

  const [puzzle, setPuzzle] = useState(null)
  const [error, setError] = useState(null)
  const [date] = useState(getTodayUTC)
  const [mode, setMode] = useState(null)

  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY) === 'true'
    setMode(visited ? 'daily' : 'welcome')
  }, [])

  useEffect(() => {
    if (!mode || mode === 'welcome') return
    setPuzzle(null)
    setError(null)
    const url = mode === 'tutorial' ? '/tutorial.json' : `/puzzles/${date}.json`
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(setPuzzle)
      .catch(() => setError('noPuzzle'))
  }, [mode, date])

  function handleStartTutorial() {
    localStorage.setItem(VISITED_KEY, 'true')
    setMode('tutorial')
  }

  function handleSkipTutorial() {
    localStorage.setItem(VISITED_KEY, 'true')
    setMode('daily')
  }

  function handleTutorialDone() {
    setMode('daily')
  }

  if (mode === null) return null

  if (mode === 'welcome') {
    return (
      <WelcomeModal
        onTutorial={handleStartTutorial}
        onSkip={handleSkipTutorial}
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="text-4xl">📭</div>
          <h2 className="text-xl font-bold text-text-primary">No puzzle today</h2>
          <p className="text-text-muted text-sm">Check back tomorrow for a new puzzle!</p>
        </div>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-accent text-lg font-medium animate-pulse">Loading puzzle...</div>
      </div>
    )
  }

  return (
    <GameBoard
      key={mode}
      puzzle={puzzle}
      date={date}
      isTutorial={mode === 'tutorial'}
      onTutorialDone={handleTutorialDone}
    />
  )
}
