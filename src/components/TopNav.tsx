// TopNav.tsx — ניווט עליון פשוט עם הדגשת מסך פעיל
// הערה: NavLink יודע לתת isActive לפי ה-URL הנוכחי
import { NavLink } from 'react-router-dom'

const tabs: Array<[string, string]> = [
  ['/', 'דאשבורד'],
  ['/step-1', 'שלב 1'],
  ['/step-2', 'שלב 2'],
  ['/step-3', 'שלב 3'],
]

export default function TopNav() {
  return (
    <nav className="flex gap-2 mb-6 justify-end">
      {tabs.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            // מחלקות Tailwind משתנות לפי מצב isActive
            `px-3 py-1 rounded-lg border transition
             ${isActive ? 'bg-purple-200 border-purple-400 text-purple-800'
                        : 'bg-white border-gray-300 hover:bg-gray-50'}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
