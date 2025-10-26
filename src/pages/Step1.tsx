// טופס שלב 1 עם הערות בעברית
import { useState } from 'react'
import type { FormEvent } from 'react'
import PageCard from '../components/PageCard'
import { useWizard } from '../components/store/wizard'
import clsx from 'classnames' // אם אין: npm i classnames

export default function Step1() {
  const { step1, setStep1 } = useWizard()
  const [tagInput, setTagInput] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    console.log('שלב 1 נשמר:', step1)
    alert('שלב 1 נשמר! (בהמשך נחבר לשרת/אחסון)')
  }

  function addTag() {
    const t = tagInput.trim()
    if (!t || step1.tags.includes(t)) return
    setStep1({ tags: [...step1.tags, t] })
    setTagInput('')
  }
  function removeTag(t: string) {
    setStep1({ tags: step1.tags.filter(x => x !== t) })
  }

  return (
    <PageCard title="שלב 1 – הגדרת האתגר">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* כותרת הפרויקט */}
        <div>
          <label className="block mb-1 font-medium">כותרת הפרויקט</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={step1.title}
            onChange={(e) => setStep1({ title: e.target.value })}
            placeholder="שם קצר וברור ליוזמה"
          />
        </div>

        {/* ניסוח האתגר */}
        <div>
          <label className="block mb-1 font-medium">מה האתגר?</label>
          <textarea
            className="w-full rounded-xl border border-gray-300 px-3 py-2 min-h-28 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={step1.problem}
            onChange={(e) => setStep1({ problem: e.target.value })}
            placeholder="תארי בקצרה את הבעיה / ההזדמנות"
          />
          <p className="text-sm text-gray-500 mt-1">טיפ: הוסיפי תאריך יעד/מדד הצלחה אם יש.</p>
        </div>

        {/* קהל יעד */}
        <div>
          <label className="block mb-1 font-medium">קהל יעד</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={step1.audience}
            onChange={(e) => setStep1({ audience: e.target.value })}
            placeholder="למי זה נועד? (תלמידים/צוות/קהילה...)"
          />
        </div>

        {/* תגיות */}
        <div>
          <label className="block mb-1 font-medium">תגיות</label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), addTag()) : null}
              placeholder="כתבי תג ולחצי Enter (לדוג׳: מחקר, עיצוב)"
            />
            <button type="button" onClick={addTag}
              className="rounded-xl px-4 py-2 bg-purple-600 text-white hover:bg-purple-700">
              הוספת תג
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {step1.tags.map(t => (
              <span key={t}
                className={clsx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm',
                                'bg-purple-100 text-purple-800')}>
                {t}
                <button type="button" className="hover:text-purple-900" onClick={() => removeTag(t)} title="הסרה">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* כפתורים */}
        <div className="flex items-center justify-between">
          <button type="submit" className="rounded-xl px-4 py-2 bg-green-600 text-white hover:bg-green-700">
            שמירה
          </button>
          <a href="/step-2" className="text-purple-700 hover:underline">המשך לשלב 2 →</a>
        </div>
      </form>
    </PageCard>
  )
}
