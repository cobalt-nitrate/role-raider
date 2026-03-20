import type { Job } from '../../types'
import ScoreBar from '../ui/ScoreBar'
import Badge from '../ui/Badge'

interface Props {
  jobs: Job[]
  onSelect: (job: Job) => void
}

function statusVariant(s: string | null): 'green' | 'red' | 'yellow' | 'gray' {
  if (s === 'applied') return 'green'
  if (s === 'failed') return 'red'
  if (s === 'in_progress') return 'yellow'
  return 'gray'
}

export default function JobTable({ jobs, onSelect }: Props) {
  if (jobs.length === 0)
    return <div className="text-center text-slate-500 py-16">No jobs found.</div>

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-900 text-slate-400 text-left text-xs uppercase tracking-wider">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Company / Site</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {jobs.map((j) => (
            <tr
              key={j.url}
              onClick={() => onSelect(j)}
              className="hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-slate-100 max-w-xs truncate">
                {j.title || '—'}
              </td>
              <td className="px-4 py-3 text-slate-400">{j.site || '—'}</td>
              <td className="px-4 py-3 text-slate-400 max-w-[10rem] truncate">{j.location || '—'}</td>
              <td className="px-4 py-3"><ScoreBar score={j.fit_score} /></td>
              <td className="px-4 py-3">
                {j.apply_status ? (
                  <Badge label={j.apply_status} variant={statusVariant(j.apply_status)} />
                ) : j.tailored_resume_path ? (
                  <Badge label="ready" variant="blue" />
                ) : j.fit_score !== null ? (
                  <Badge label="scored" variant="gray" />
                ) : (
                  <Badge label="new" variant="gray" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
