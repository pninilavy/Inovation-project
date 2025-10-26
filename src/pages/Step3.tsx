// שלב 3 – סיעור מוחות
// לוח פתקים: הוספת רעיון, בחירת צבע, הצבעה (+/-), ומחיקה.
// הכל נשמר ב-Zustand (כולל פרסיסט).

import { useState } from 'react'
import PageCard from '../components/PageCard'
import { useWizard } from '../components/store/wizard'
import clsx from 'classnames'

const COLORS: { key: 'yellow'|'blue'|'green'|'pink'; label: string; bg: string; text: string }[] = [
  { key: 'yellow', label: 'צהוב', bg: 'bg-yellow-100', text: 'text-yellow-900' },
  { key: 'blue',   label: 'כחול', bg: 'bg-blue-100',   text: 'text-blue-900' },
  { key: 'green',  label: 'ירוק', bg: 'bg-green-100',  text: 'text-green-900' },
  { key: 'pink',   label: 'ורוד', bg: 'bg-pink-100',   text: 'text-pink-900' },
]

export default function Step3() {
  const { ideas, addIdea, voteIdea, removeIdea } = useWizard()

  const [text, setText] = useState('')
  const [color, setColor] = useState<'yellow'|'blue'|'green'|'pink'>('yellow')

  function onAdd() {
    const t = text.trim()
    if (!t) return
    addIdea(t, color)
    setText('')
  }

  return (
    <PageCard title="שלב 3 – סיעור מוחות">
      {/* טופס הוספת רעיון */}
      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <input
          className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 md:col-span-2"
          placeholder="כתבי רעיון קצר..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex items-center gap-2 md:justify-end">
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c.key}
                className={clsx(
                  'px-2 py-1 rounded-lg border',
                  color === c.key ? `${c.bg} border-purple-400` : 'bg-white border-gray-300'
                )}
                onClick={() => setColor(c.key)}
                title={`צבע: ${c.label}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={onAdd}
            className="rounded-xl px-4 py-2 bg-purple-600 text-white hover:bg-purple-700"
          >
            הוספת רעיון
          </button>
        </div>
      </div>

      {/* לוח פתקים */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.length === 0 && (
          <p className="text-gray-500">עוד אין רעיונות. הוסיפי למעלה את הראשון ✨</p>
        )}

        {ideas.map((i) => {
          const palette = COLORS.find(c => c.key === i.color)!
          return (
            <div
              key={i.id}
              className={clsx('rounded-2xl p-4 border shadow-sm', palette.bg)}
            >
              <div className={clsx('font-medium mb-2', palette.text)}>{i.text}</div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg px-2 py-1 border border-gray-300 hover:bg-white"
                    onClick={() => voteIdea(i.id, 1)}
                    title="פלוס הצבעה"
                  >
                    +1
                  </button>
                  <span className="font-semibold">{i.votes}</span>
                  <button
                    className="rounded-lg px-2 py-1 border border-gray-300 hover:bg-white"
                    onClick={() => voteIdea(i.id, -1)}
                    title="מינוס הצבעה"
                  >
                    −1
                  </button>
                </div>

                <button
                  className="text-red-700 hover:underline"
                  onClick={() => removeIdea(i.id)}
                  title="מחיקה"
                >
                  מחיקה
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </PageCard>
  )
}
