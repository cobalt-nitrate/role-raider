import { useState } from 'react'
import { startApply, stopApply } from '../api/apply'
import { useSSE } from '../hooks/useSSE'
import { useTaskStore } from '../store/taskStore'
import LogViewer from '../components/ui/LogViewer'

export default function Apply() {
  const [limit, setLimit] = useState(1)
  const [workers, setWorkers] = useState(1)
  const [minScore, setMinScore] = useState(7)
  const [model, setModel] = useState('haiku')
  const [headless, setHeadless] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [continuous, setContinuous] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const [error, setError] = useState('')

  const { applyTaskId, setApplyTask } = useTaskStore()
  const { lines, done, error: sseError } = useSSE(applyTaskId)

  const handleStart = async () => {
    setError('')
    try {
      const { task_id } = await startApply({
        limit, workers, min_score: minScore, model,
        headless, dry_run: dryRun, continuous,
        target_url: targetUrl || undefined,
      })
      setApplyTask(task_id)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to start apply')
    }
  }

  const handleStop = async () => {
    await stopApply().catch(() => {})
    setApplyTask(null)
  }

  const isRunning = !!applyTaskId && !done

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Auto-Apply</h1>

      {dryRun && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-yellow-400">
          Dry run is ON — forms will be filled but not submitted. Toggle off when ready.
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Limit (0 = unlimited)</label>
            <input type="number" min={0} value={limit} onChange={(e) => setLimit(+e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Workers (Chrome instances)</label>
            <input type="number" min={1} max={5} value={workers} onChange={(e) => setWorkers(+e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min Score</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min={1} max={10} value={minScore}
                onChange={(e) => setMinScore(+e.target.value)} className="flex-1 accent-indigo-500" />
              <span className="text-sm text-slate-300 w-4">{minScore}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Claude Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500">
              <option value="haiku">haiku (fast, cheap)</option>
              <option value="sonnet">sonnet (balanced)</option>
              <option value="opus">opus (best)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Target URL (optional)</label>
            <input type="text" placeholder="Apply to one specific job"
              value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col gap-2 justify-end pb-1">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="accent-indigo-500" />
              Dry run (safe)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={headless} onChange={(e) => setHeadless(e.target.checked)} className="accent-indigo-500" />
              Headless
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={continuous} onChange={(e) => setContinuous(e.target.checked)} className="accent-indigo-500" />
              Continuous
            </label>
          </div>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3">
          <button onClick={handleStart} disabled={isRunning}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors">
            {isRunning ? 'Running...' : '🚀 Start Apply'}
          </button>
          {isRunning && (
            <button onClick={handleStop}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium border border-red-500/30 transition-colors">
              ■ Stop
            </button>
          )}
        </div>
      </div>

      {applyTaskId && <LogViewer lines={lines} done={done} error={sseError} />}
    </div>
  )
}
