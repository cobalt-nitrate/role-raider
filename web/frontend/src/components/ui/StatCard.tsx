interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  color?: string
}

export default function StatCard({ label, value, sub, color = 'text-slate-100' }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
