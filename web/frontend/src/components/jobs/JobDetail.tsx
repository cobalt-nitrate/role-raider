import type { Job } from '../../types'
import ScoreBar from '../ui/ScoreBar'
import Badge from '../ui/Badge'

interface Props { job: Job; onClose: () => void }

export default function JobDetail({ job, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 overflow-y-auto p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{job.title || 'Untitled'}</h2>
            <div className="text-sm text-slate-400 mt-1">{job.site} · {job.location}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl shrink-0">✕</button>
        </div>

        <div className="flex items-center gap-4">
          <ScoreBar score={job.fit_score} />
          {job.apply_status && <Badge label={job.apply_status} variant={job.apply_status === 'applied' ? 'green' : job.apply_status === 'failed' ? 'red' : 'yellow'} />}
          {job.salary && <span className="text-sm text-slate-400">{job.salary}</span>}
        </div>

        {job.score_reasoning && (
          <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 leading-relaxed">
            <div className="text-xs text-slate-500 uppercase mb-2">Score Reasoning</div>
            {job.score_reasoning}
          </div>
        )}

        {job.apply_error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
            <div className="text-xs uppercase mb-1">Apply Error</div>
            {job.apply_error}
          </div>
        )}

        <div>
          <div className="text-xs text-slate-500 uppercase mb-2">Full Description</div>
          <pre className="whitespace-pre-wrap text-xs text-slate-300 bg-slate-800 rounded-lg p-4 max-h-72 overflow-y-auto leading-relaxed font-sans">
            {job.full_description || job.description || 'No description available'}
          </pre>
        </div>

        <div className="flex gap-3">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:underline"
            >
              View Listing ↗
            </a>
          )}
          {job.application_url && (
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:underline"
            >
              Apply Directly ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
