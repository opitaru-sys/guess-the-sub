import categories from '../data/categories.json'

const hintLabels = [
  'Post Preview',
  'Top Comment',
  'Subreddit Stats',
  'Topic Category',
  'Description',
]

function getHintContent(puzzle, index, slot1IsTopComment) {
  switch (index) {
    case 0: {
      if (puzzle.post.body_preview) return puzzle.post.body_preview
      if (puzzle.post.top_comment) return puzzle.post.top_comment
      if (puzzle.post.is_link_post && puzzle.post.link_domain) {
        return `Links to: ${puzzle.post.link_domain}`
      }
      return 'No preview available'
    }
    case 1: {
      // If hint 1 already used top_comment (because no body), show subscriber range here instead
      if (slot1IsTopComment) {
        return puzzle.answer.subscribers_range + ' subscribers'
      }
      if (puzzle.post.top_comment) return puzzle.post.top_comment
      return puzzle.answer.subscribers_range + ' subscribers'
    }
    case 2:
      return `${puzzle.answer.subscribers_range} subscribers · created in ${puzzle.answer.created_year}`
    case 3:
      return puzzle.answer.category || categories[puzzle.answer.subreddit] || 'Uncategorized'
    case 4:
      return puzzle.answer.description
    default:
      return ''
  }
}

function getHintLabel(puzzle, index, slot1IsTopComment) {
  if (index === 1 && slot1IsTopComment) return 'Subreddit Stats'
  return hintLabels[index]
}

export default function HintArea({ puzzle, hintsRevealed }) {
  if (hintsRevealed === 0) return null

  // If puzzle has no body but has a top comment, slot 1 will use top_comment.
  // In that case, slot 2 should show something else (subscriber stats).
  const slot1IsTopComment = !puzzle.post.body_preview && !!puzzle.post.top_comment

  return (
    <div className="space-y-2">
      {Array.from({ length: Math.min(hintsRevealed, 5) }, (_, i) => (
        <div
          key={i}
          className="animate-fade-slide-in bg-bg-surface border border-border rounded-lg p-3 sm:p-4"
        >
          <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            Hint {i + 1}: {getHintLabel(puzzle, i, slot1IsTopComment)}
          </div>
          <div className="text-sm text-text-primary leading-relaxed">
            {getHintContent(puzzle, i, slot1IsTopComment)}
          </div>
        </div>
      ))}
    </div>
  )
}
