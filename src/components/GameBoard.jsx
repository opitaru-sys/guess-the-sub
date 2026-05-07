import { useState, useMemo, useEffect, useCallback } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useStats } from '../hooks/useStats'
import { getPuzzleNumber } from '../utils/dateUtils'
import { recordCompletion, fetchStats } from '../utils/communityStats'
import PostCard from './PostCard'
import HintArea from './HintArea'
import GuessInput from './GuessInput'
import GuessHistory from './GuessHistory'
import ResultsModal from './ResultsModal'
import HowToPlay from './HowToPlay'

export default function GameBoard({ puzzle, date, isTutorial = false, onTutorialDone }) {
  const { stats, recordWin, recordLoss } = useStats()
  const [communityStats, setCommunityStats] = useState(null)
  const [communityLoading, setCommunityLoading] = useState(false)
  const [communityFetched, setCommunityFetched] = useState(false)

  const submitCommunity = useCallback((wonArg, count) => {
    if (isTutorial) return
    setCommunityLoading(true)
    recordCompletion(date, wonArg, count).then(s => {
      setCommunityStats(s)
      setCommunityLoading(false)
      setCommunityFetched(true)
    })
  }, [date, isTutorial])

  const handleWin = useCallback((count) => {
    recordWin(count)
    submitCommunity(true, count)
  }, [recordWin, submitCommunity])

  const handleLoss = useCallback(() => {
    recordLoss()
    submitCommunity(false, null)
  }, [recordLoss, submitCommunity])

  const {
    guesses, completed, won, hintsRevealed,
    submitGuess, maxGuesses, initialized,
  } = useGameState({
    puzzle,
    storageKey: isTutorial ? 'guessTheSub_tutorial' : 'guessTheSub_today',
    stateKey: isTutorial ? 'tutorial' : date,
    onWin: isTutorial ? null : handleWin,
    onLoss: isTutorial ? null : handleLoss,
    persist: !isTutorial,
  })

  useEffect(() => {
    if (isTutorial || !completed || communityFetched || communityLoading) return
    setCommunityLoading(true)
    fetchStats(date).then(s => {
      setCommunityStats(s)
      setCommunityLoading(false)
      setCommunityFetched(true)
    })
  }, [completed, isTutorial, date, communityFetched, communityLoading])

  const [showResults, setShowResults] = useState(false)
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const puzzleNumber = isTutorial ? null : getPuzzleNumber(date)

  const guessedNames = useMemo(
    () => new Set(guesses.map(g => g.name.toLowerCase())),
    [guesses]
  )

  if (!initialized) return null

  const showResultsOnComplete = completed && !showResults

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => setShowHowToPlay(true)}
          className="text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer"
          title="How to Play"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Guess the Sub</h1>
          <p className="text-xs text-text-muted">
            {isTutorial ? 'Tutorial' : `Puzzle #${puzzleNumber}`}
          </p>
        </div>
        {isTutorial ? (
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
            DEMO
          </span>
        ) : (
          <div className="flex items-center gap-1 text-text-muted text-sm" title="Current streak">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z" />
            </svg>
            <span className="font-semibold">{stats.currentStreak}</span>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4 space-y-4">
        {isTutorial && (
          <div className="text-sm text-text-muted bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 leading-relaxed">
            <strong className="text-accent">Tutorial:</strong> Try to guess the subreddit. Wrong guesses
            reveal hints. Take your time — this run won't affect your stats.
          </div>
        )}

        <PostCard title={puzzle.post.title} />

        <HintArea puzzle={puzzle} hintsRevealed={hintsRevealed} />

        {!completed && (
          <div className="text-center">
            <p className="text-xs text-text-muted mb-1">
              Guess {guesses.length + 1} of {maxGuesses}
            </p>
            <div className="flex gap-1 justify-center mb-3">
              {Array.from({ length: maxGuesses }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < guesses.length
                      ? guesses[i].correct ? 'bg-success' : 'bg-wrong'
                      : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <GuessInput
          onGuess={submitGuess}
          disabled={completed}
          guessedNames={guessedNames}
        />

        <GuessHistory guesses={guesses} />

        {showResultsOnComplete && (
          <div className="text-center space-y-3 animate-fade-slide-in">
            <div className={`text-lg font-bold ${won ? 'text-success' : 'text-wrong'}`}>
              {won
                ? `🎉 You got it in ${guesses.length}!`
                : `The answer was ${puzzle.answer.display_name}`
              }
            </div>
            {isTutorial ? (
              <button
                onClick={onTutorialDone}
                className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Now play today's puzzle →
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                View Results & Share
              </button>
            )}
          </div>
        )}
      </main>

      {showResults && !isTutorial && (
        <ResultsModal
          won={won}
          guesses={guesses}
          maxGuesses={maxGuesses}
          puzzleNumber={puzzleNumber}
          puzzle={puzzle}
          stats={stats}
          communityStats={communityStats}
          communityLoading={communityLoading}
          onClose={() => setShowResults(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlay onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  )
}
