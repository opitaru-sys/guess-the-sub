import { useState, useCallback } from 'react'

const STATS_KEY = 'guessTheSub_stats'

const defaultStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0, 0],
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return defaultStats
    return { ...defaultStats, ...JSON.parse(raw) }
  } catch {
    return defaultStats
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function useStats() {
  const [stats, setStats] = useState(loadStats)

  const recordWin = useCallback((guessCount) => {
    setStats(prev => {
      const next = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        wins: prev.wins + 1,
        currentStreak: prev.currentStreak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.currentStreak + 1),
        distribution: [...prev.distribution],
      }
      next.distribution[guessCount - 1]++
      saveStats(next)
      return next
    })
  }, [])

  const recordLoss = useCallback(() => {
    setStats(prev => {
      const next = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: 0,
        distribution: [...prev.distribution],
      }
      next.distribution[6]++
      saveStats(next)
      return next
    })
  }, [])

  return { stats, recordWin, recordLoss }
}
