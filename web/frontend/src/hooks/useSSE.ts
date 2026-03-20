import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useSSE(taskId: string | null) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!taskId) return
    setLines([])
    setDone(false)
    setError(false)

    const es = new EventSource(`${BASE}/stream/${taskId}`)
    esRef.current = es

    es.onmessage = (e) => {
      if (e.data === '__DONE__') {
        setDone(true)
        es.close()
      } else if (e.data === '__ERROR__') {
        setError(true)
        setDone(true)
        es.close()
      } else {
        setLines((prev) => [...prev, e.data])
      }
    }

    es.onerror = () => {
      setError(true)
      setDone(true)
      es.close()
    }

    return () => es.close()
  }, [taskId])

  return { lines, done, error }
}
