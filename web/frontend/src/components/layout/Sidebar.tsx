import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/jobs', label: 'Jobs', icon: '⚡' },
  { to: '/pipeline', label: 'Pipeline', icon: '⚙' },
  { to: '/apply', label: 'Auto-Apply', icon: '🚀' },
  { to: '/settings', label: 'Settings', icon: '⚒' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <span className="text-xl font-bold text-indigo-400">⚔ Role Raider</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-600 border-t border-slate-800">
        github.com/cobalt-nitrate
      </div>
    </aside>
  )
}
