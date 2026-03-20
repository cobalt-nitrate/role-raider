import { useStats } from '../hooks/useStats'
import StatCard from '../components/ui/StatCard'

export default function Dashboard() {
  const { stats, loading, backendDown } = useStats()

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>
  if (backendDown || !stats) return (
    <div className="p-8">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm space-y-1">
        <div className="font-semibold">Cannot reach backend</div>
        <div className="text-red-500/70">Make sure it's running: <code className="font-mono">cd web/backend && python3 -m uvicorn main:app --reload</code></div>
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Discovered" value={stats.total} />
        <StatCard label="Scored" value={stats.scored} sub={`${stats.unscored} pending`} />
        <StatCard label="Tailored" value={stats.tailored} sub={`${stats.untailored_eligible} eligible`} />
        <StatCard label="Applied" value={stats.applied} color="text-emerald-400" sub={`${stats.ready_to_apply} ready`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Score distribution */}
        {stats.score_distribution.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Score Distribution</h2>
            <div className="space-y-2">
              {stats.score_distribution.map(([score, count]) => {
                const max = Math.max(...stats.score_distribution.map(([, c]) => c))
                const pct = (count / max) * 100
                const color = score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                return (
                  <div key={score} className="flex items-center gap-3">
                    <span className="w-4 text-sm text-slate-400 text-right">{score}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-xs text-slate-500 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* By site */}
        {stats.by_site.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Jobs by Source</h2>
            <div className="space-y-2">
              {stats.by_site.slice(0, 10).map(([site, count]) => (
                <div key={site} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{site || 'Unknown'}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Enriched" value={stats.with_description} sub={`${stats.pending_detail} pending`} />
        <StatCard label="Cover Letters" value={stats.with_cover_letter} />
        <StatCard label="Apply Errors" value={stats.apply_errors} color={stats.apply_errors > 0 ? 'text-red-400' : 'text-slate-100'} />
        <StatCard label="Enrich Errors" value={stats.detail_errors} color={stats.detail_errors > 0 ? 'text-yellow-400' : 'text-slate-100'} />
      </div>
    </div>
  )
}
