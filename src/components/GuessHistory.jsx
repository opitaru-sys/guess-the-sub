export default function GuessHistory({ guesses }) {
  if (guesses.length === 0) return null

  return (
    <div className="space-y-2">
      {guesses.map((guess, i) => (
        <div
          key={i}
          className={`animate-fade-slide-in flex items-center gap-3 px-4 py-2.5 rounded-lg border ${
            guess.correct
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-wrong/10 border-wrong/30 text-wrong'
          }`}
        >
          <span className="text-lg">{guess.correct ? '✓' : '✗'}</span>
          <span className="font-medium text-sm">r/{guess.name}</span>
          <span className="ml-auto text-xs opacity-60">#{i + 1}</span>
        </div>
      ))}
    </div>
  )
}
