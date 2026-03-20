interface BadgeProps { label: string; variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' }

const map = {
  green: 'bg-emerald-500/20 text-emerald-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-indigo-500/20 text-indigo-400',
  gray: 'bg-slate-700 text-slate-400',
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[variant]}`}>
      {label}
    </span>
  )
}
