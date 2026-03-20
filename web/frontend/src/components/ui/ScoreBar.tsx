export default function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-600 text-sm">—</span>
  const pct = (score / 10) * 100
  const color = score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-medium ${score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  )
}
