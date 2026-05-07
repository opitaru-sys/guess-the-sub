export default function WelcomeModal({ onTutorial, onSkip }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="animate-confetti-pop bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">👋</div>
          <h3 className="text-xl font-bold text-text-primary">Welcome to Guess the Sub</h3>
          <p className="text-text-muted text-sm mt-2 leading-relaxed">
            Each day, a real Reddit post. Your job: name the subreddit. 6 guesses, hints between.
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={onTutorial}
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
          >
            Show me how it works
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-bg-elevated hover:bg-bg-elevated/70 text-text-primary font-medium py-3 rounded-lg transition-colors cursor-pointer"
          >
            Skip to today's puzzle
          </button>
        </div>
      </div>
    </div>
  )
}
