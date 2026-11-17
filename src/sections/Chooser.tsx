import { recommend, type Answers } from '../recommend.ts'
import { ToolIcon } from '../ToolIcon.tsx'
import { swatch, TOOLS } from '../tools.ts'

type Option<K extends keyof Answers> = { value: Answers[K]; label: string }
const QUESTIONS: { [K in keyof Answers]: { q: string; options: Option<K>[] } } = {
  workload: {
    q: 'What does the data mostly do?',
    options: [
      { value: 'transactions', label: 'Create / update records' },
      { value: 'mixed', label: 'Both' },
      { value: 'analytics', label: 'Answer “how many / how much”' },
    ],
  },
  timeseries: {
    q: 'Is it mostly timestamped readings (metrics, sensors, prices)?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes, time series' },
    ],
  },
  deployment: {
    q: 'Where does it run?',
    options: [
      { value: 'embedded', label: 'Inside the app / device' },
      { value: 'server', label: 'On a server' },
    ],
  },
  writers: {
    q: 'Who writes at the same time?',
    options: [
      { value: 'one', label: 'One process' },
      { value: 'many', label: 'Many users / services' },
    ],
  },
  size: {
    q: 'How much data?',
    options: [
      { value: 0, label: '< 1 GB' },
      { value: 1, label: '~10s GB' },
      { value: 2, label: '~100s GB' },
      { value: 3, label: 'TB +' },
    ],
  },
  consumers: {
    q: 'Who reads the numbers?',
    options: [
      { value: 'app', label: 'Just my app' },
      { value: 'bi', label: 'Many dashboards & teams' },
    ],
  },
}

export function Chooser({ answers, onChange }: { answers: Answers; onChange: (a: Answers) => void }) {
  const scores = recommend(answers)
  const [first, second] = scores
  const pairWithCube = first.id === 'cube' || (second.id === 'cube' && second.score >= 60)
  const store = scores.find((s) => s.id !== 'cube')!

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        {(Object.keys(QUESTIONS) as (keyof Answers)[]).map((k) => (
          <fieldset key={k}>
            <legend className="mb-2 text-sm text-ink-2">{QUESTIONS[k].q}</legend>
            <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1 ring-1 ring-white/10">
              {QUESTIONS[k].options.map((o) => {
                const on = answers[k] === o.value
                return (
                  <button
                    key={String(o.value)}
                    aria-pressed={on}
                    onClick={() => onChange({ ...answers, [k]: o.value })}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition ${
                      on ? 'bg-ink text-page shadow' : 'text-ink-2 hover:bg-raised'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="rounded-xl bg-surface p-5 ring-1 ring-white/10">
        <p className="text-xs uppercase tracking-wide text-muted">Recommendation</p>
        <p className="mt-1 text-3xl font-semibold">
          {pairWithCube ? `${TOOLS[store.id].name} + Cube` : TOOLS[first.id].name}
        </p>
        {pairWithCube && (
          <p className="mt-1 text-sm text-ink-2">Cube stores nothing itself — it models and caches metrics on top of {TOOLS[store.id].name}.</p>
        )}

        <ul className="mt-6 space-y-3" aria-label="Fit score per tool">
          {scores.map((s) => (
            <li key={s.id} className="grid grid-cols-[8rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="flex items-center gap-2 text-ink-2">
                <ToolIcon id={s.id} size={14} />
                {TOOLS[s.id].name}
              </span>
              <span className="h-3 rounded-full bg-grid">
                <span
                  className="block h-full rounded-full transition-all duration-500"
                  style={{ ...swatch(s.id), width: `${s.score}%` }}
                />
              </span>
              <span className="text-right tabular-nums text-ink">{s.score}</span>
            </li>
          ))}
        </ul>

        <h4 className="mt-6 text-sm font-medium">Why {TOOLS[first.id].name}</h4>
        <ul className="mt-2 space-y-1 text-sm text-ink-2">
          {first.why.map((w) => (
            <li key={w} className={w.startsWith("+") ? "" : "text-muted"}>{w}</li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted">Teaching heuristic, not a benchmark.</p>
      </div>
    </div>
  )
}
