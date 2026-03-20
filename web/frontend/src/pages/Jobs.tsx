import { useEffect, useState } from 'react'
import { fetchJobs } from '../api/jobs'
import type { Job } from '../types'
import JobTable from '../components/jobs/JobTable'
import JobDetail from '../components/jobs/JobDetail'

const STAGES = ['discovered', 'enriched', 'scored', 'tailored', 'applied']

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stage, setStage] = useState('discovered')
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [selected, setSelected] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchJobs({ stage, min_score: minScore, search })
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [stage, minScore, search])

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Jobs</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                stage === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search title, site..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-52"
        />

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Min score</span>
          <input
            type="range" min={0} max={10} value={minScore}
            onChange={(e) => setMinScore(+e.target.value)}
            className="w-24 accent-indigo-500"
          />
          <span className="w-4 text-slate-300">{minScore}</span>
        </div>

        <span className="ml-auto text-sm text-slate-500">{jobs.length} jobs</span>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : (
        <JobTable jobs={jobs} onSelect={setSelected} />
      )}

      {selected && <JobDetail job={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
