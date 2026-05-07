export function getTodayUTC() {
  return new Date().toISOString().slice(0, 10)
}

export function getPuzzleNumber(dateStr) {
  const start = new Date('2026-05-06')
  const current = new Date(dateStr)
  return Math.floor((current - start) / (1000 * 60 * 60 * 24)) + 1
}
