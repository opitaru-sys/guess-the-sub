import categories from '../data/categories.json'

const hintLabels = [
  'Post Preview',
  'Subscriber Count',
  'Created Year',
  'Topic Category',
  'Description',
]

function getHintContent(puzzle, index) {
  switch (index) {
    case 0:
      if (puzzle.post.body_preview) return puzzle.post.body_preview
      if (puzzle.post.top_comment) return `Top comment: "${puzzle.post.top_comment}"`
      if (puzzle.post.is_link_post && puzzle.post.link_domain) {
        return `Links to: ${puzzle.post.link_domain}`
      }
      return 'No preview available'
    case 1:
      return puzzle.answer.subscribers_range + ' subscribers'
    case 2:
      return `Created in ${puzzle.answer.created_year}`
    case 3:
      return puzzle.answer.category || categories[puzzle.answer.subreddit] || 'Uncategorized'
    case 4:
      return puzzle.answer.description
    default:
      return ''
  }
}

export default function HintArea({ puzzle, hintsRevealed }) {
  if (hintsRevealed === 0) return null

  return (
    <div className="space-y-2">
      {Array.from({ length: Math.min(hintsRevealed, 5) }, (_, i) => (
        <div
          key={i}
          className="animate-fade-slide-in bg-bg-surface border border-border rounded-lg p-3 sm:p-4"
        >
          <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            Hint {i + 1}: {hintLabels[i]}
          </div>
          <div className="text-sm text-text-primary leading-relaxed">
            {getHintContent(puzzle, i)}
          </div>
        </div>
      ))}
    </div>
  )
}
