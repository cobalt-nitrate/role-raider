import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Stats } from '../types'

export function useStats(intervalMs = 5000) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () =>
      api.get<Stats>('/stats').then(r => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
    load()
    const t = setInterval(load, intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])

  return { stats, loading }
}
