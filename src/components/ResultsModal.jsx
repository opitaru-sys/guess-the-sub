import { useState } from 'react'
import { generateShareText, copyToClipboard } from '../utils/shareResults'
import StatsDisplay from './StatsDisplay'
import CommunityStats from './CommunityStats'

export default function ResultsModal({ won, guesses, maxGuesses, puzzleNumber, puzzle, stats, communityStats, communityLoading, onClose }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const text = generateShareText(puzzleNumber, guesses, maxGuesses, won)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="animate-confetti-pop bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          {won ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-success">You got it!</h3>
              <p className="text-text-muted text-sm mt-1">
                in {guesses.length}/{maxGuesses} guess{guesses.length !== 1 ? 'es' : ''}
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">😞</div>
              <h3 className="text-xl font-bold text-wrong">Better luck tomorrow!</h3>
            </>
          )}
        </div>

        <div className="bg-bg-elevated rounded-lg p-4 mb-4 text-center">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">The answer was</p>
          <p className="text-accent font-bold text-lg">{puzzle.answer.display_name}</p>
          {puzzle.post.permalink && (
            <a
              href={`https://www.reddit.com${puzzle.post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent/70 hover:text-accent mt-1 inline-block"
            >
              View original post →
            </a>
          )}
        </div>

        <StatsDisplay stats={stats} />

        <CommunityStats stats={communityStats} loading={communityLoading} />

        <button
          onClick={handleShare}
          className="w-full mt-4 bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
        >
          {copied ? 'Copied!' : 'Share Results 📋'}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-text-muted hover:text-text-primary text-sm py-2 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  )
}
