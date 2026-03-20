import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useTaskStore } from '../store/taskStore'
import type { Stats } from '../types'

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [backendDown, setBackendDown] = useState(false)

  const { pipelineTaskId, applyTaskId } = useTaskStore()
  const isRunning = !!pipelineTaskId || !!applyTaskId

  useEffect(() => {
    let cancelled = false
    const load = () => {
      if (cancelled) return
      api.get<Stats>('/stats')
        .then(r => { if (!cancelled) { setStats(r.data); setLoading(false); setBackendDown(false) } })
        .catch(() => { if (!cancelled) { setLoading(false); setBackendDown(true) } })
    }

    load()

    // Only poll while a task is actively running — one fetch is enough otherwise
    if (!isRunning) return () => { cancelled = true }
    const t = setInterval(load, 3000)
    return () => { cancelled = true; clearInterval(t) }
  }, [isRunning])

  return { stats, loading, backendDown }
}
