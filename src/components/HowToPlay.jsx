export default function HowToPlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="animate-confetti-pop bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-text-primary mb-4">How to Play</h3>

        <div className="space-y-3 text-sm text-text-primary/80">
          <p>
            Each day, you'll see the title of a real Reddit post.
            Your goal: guess which subreddit it came from.
          </p>
          <p>
            You have <strong className="text-accent">6 guesses</strong>. After each wrong guess, a new hint is revealed:
          </p>

          <ol className="space-y-2 pl-4">
            {[
              'Post body preview or link domain',
              'Subscriber count range',
              'Subreddit creation year',
              'Topic category',
              'Subreddit description',
            ].map((hint, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent font-semibold shrink-0">{i + 1}.</span>
                <span>{hint}</span>
              </li>
            ))}
          </ol>

          <div className="border-t border-border pt-3 mt-3 space-y-1 text-xs text-text-muted">
            <p>🟩 = correct &nbsp; 🟥 = wrong &nbsp; ⬜ = unused</p>
            <p>A new puzzle drops every day at midnight UTC.</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
