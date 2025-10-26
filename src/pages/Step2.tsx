// שלב 2 – איסוף מידע / מקורות / תובנות
// מאפשר להוסיף קישור או הערה, לסמן “טופל”, ולמחוק.
// הכל נשמר ב-Zustand (כולל פרסיסט בלוקאל סטורג’).

import { useState } from 'react'
import PageCard from '../components/PageCard'
import { useWizard } from '../components/store/wizard'
import clsx from 'classnames'

export default function Step2() {
  const { resources, addResource, toggleResourceDone, removeResource } = useWizard()

  // שדות טופס מקומי
  const [mode, setMode] = useState<'link' | 'note'>('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  function onAdd() {
    const t = title.trim()
    const u = url.trim()
    if (!t) return

    if (mode === 'link' && !u) return

    addResource({
      type: mode,
      title: t,
      url: mode === 'link' ? u : undefined,
    })

    setTitle('')
    setUrl('')
  }

  return (
    <PageCard title="שלב 2 – איסוף מידע">
      {/* בחירת מצב: קישור / הערה */}
      <div className="flex gap-2 mb-4">
        <button
          className={clsx(
            'px-3 py-1 rounded-lg border',
            mode === 'link'
              ? 'bg-purple-200 border-purple-400'
              : 'bg-white border-gray-300'
          )}
          onClick={() => setMode('link')}
        >
          קישור
        </button>
        <button
          className={clsx(
            'px-3 py-1 rounded-lg border',
            mode === 'note'
              ? 'bg-purple-200 border-purple-400'
              : 'bg-white border-gray-300'
          )}
          onClick={() => setMode('note')}
        >
          הערה
        </button>
      </div>

      {/* טופס הוספה */}
      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <input
          className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 md:col-span-1"
          placeholder={mode === 'link' ? 'כותרת לקישור' : 'כותרת להערה'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {mode === 'link' && (
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 md:col-span-1"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            dir="ltr"
          />
        )}
        <div className="md:col-span-1 flex">
          <button
            onClick={onAdd}
            className="rounded-xl px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 ml-auto"
          >
            הוספה
          </button>
        </div>
      </div>

      {/* רשימת מקורות */}
      <div className="space-y-3">
        {resources.length === 0 && (
          <p className="text-gray-500">עדיין לא נאספו פריטים. הוסיפי קישור או הערה למעלה.</p>
        )}

        {resources.map((r) => (
          <div
            key={r.id}
            className={clsx(
              'rounded-xl border px-4 py-3 flex items-center gap-3',
              r.done ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'
            )}
          >
            <input
              type="checkbox"
              checked={!!r.done}
              onChange={() => toggleResourceDone(r.id)}
              className="h-5 w-5"
              title="סימון הושלם"
            />

            <div className="flex-1">
              <div className="font-medium">
                {r.type === 'link' ? '🔗 ' : '📝 '}{r.title}
              </div>
              {r.url && (
                <a
                  className="text-purple-700 hover:underline text-sm"
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                >
                  {r.url}
                </a>
              )}
            </div>

            <button
              className="text-red-600 hover:underline"
              onClick={() => removeResource(r.id)}
              title="מחיקה"
            >
              מחיקה
            </button>
          </div>
        ))}
      </div>

      {/* ניווט קדימה */}
      <div className="mt-6 text-purple-700">
        <a href="/step-3" className="hover:underline">המשך לשלב 3 →</a>
      </div>
    </PageCard>
  )
}
