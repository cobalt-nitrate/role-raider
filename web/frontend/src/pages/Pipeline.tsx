import { useState } from 'react'
import { runPipeline, stopPipeline } from '../api/pipeline'
import { useSSE } from '../hooks/useSSE'
import { useTaskStore } from '../store/taskStore'
import LogViewer from '../components/ui/LogViewer'

const ALL_STAGES = ['discover', 'enrich', 'score', 'tailor', 'cover', 'pdf']

export default function Pipeline() {
  const [stages, setStages] = useState<string[]>(['all'])
  const [minScore, setMinScore] = useState(7)
  const [workers, setWorkers] = useState(1)
  const [validation, setValidation] = useState('normal')
  const [stream, setStream] = useState(false)
  const [dryRun, setDryRun] = useState(false)
  const [error, setError] = useState('')

  const { pipelineTaskId, setPipelineTask } = useTaskStore()
  const { lines, done, error: sseError } = useSSE(pipelineTaskId)

  const toggleStage = (s: string) => {
    if (s === 'all') { setStages(['all']); return }
    setStages((prev) => {
      const without = prev.filter((x) => x !== 'all' && x !== s)
      return prev.includes(s) ? without : [...without, s]
    })
  }

  const handleRun = async () => {
    setError('')
    try {
      const { task_id } = await runPipeline({ stages, min_score: minScore, workers, stream, dry_run: dryRun, validation })
      setPipelineTask(task_id)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to start pipeline')
    }
  }

  const handleStop = async () => {
    await stopPipeline().catch(() => {})
    setPipelineTask(null)
  }

  const isRunning = !!pipelineTaskId && !done

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Pipeline</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        {/* Stages */}
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Stages</label>
          <div className="flex flex-wrap gap-2">
            {['all', ...ALL_STAGES].map((s) => (
              <button
                key={s}
                onClick={() => toggleStage(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  stages.includes(s)
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Options row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min Score</label>
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={10} value={minScore}
                onChange={(e) => setMinScore(+e.target.value)} className="flex-1 accent-indigo-500" />
              <span className="text-sm text-slate-300 w-4">{minScore}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Workers</label>
            <input type="number" min={1} max={8} value={workers}
              onChange={(e) => setWorkers(+e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Validation</label>
            <select value={validation} onChange={(e) => setValidation(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500">
              <option value="lenient">lenient</option>
              <option value="normal">normal</option>
              <option value="strict">strict</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 justify-end">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={stream} onChange={(e) => setStream(e.target.checked)} className="accent-indigo-500" />
              Streaming mode
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="accent-indigo-500" />
              Dry run
            </label>
          </div>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isRunning ? 'Running...' : '▶ Run Pipeline'}
          </button>
          {isRunning && (
            <button onClick={handleStop}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30">
              ■ Stop
            </button>
          )}
        </div>
      </div>

      {pipelineTaskId && (
        <LogViewer lines={lines} done={done} error={sseError} />
      )}
    </div>
  )
}
