function getShareUrl() {
  if (typeof window === 'undefined') return 'guessthesub.com'
  const { protocol, host } = window.location
  return `${protocol}//${host}`.replace(/^https?:\/\//, '')
}

export function generateShareText(puzzleNumber, guesses, maxGuesses, won) {
  const emoji = won ? '🎯' : '😞'
  const score = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`

  const grid = Array.from({ length: maxGuesses }, (_, i) => {
    if (i < guesses.length) {
      return guesses[i].correct ? '🟩' : '🟥'
    }
    return '⬜'
  }).join('')

  return `Guess the Sub #${puzzleNumber} ${emoji} ${score}\n\n${grid}\n\n${getShareUrl()}`
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
