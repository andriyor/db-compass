import { useState } from 'react'
import { TOOL_IDS, TOOLS } from '../tools.ts'

type Fit = 0 | 1 | 2 | 3
// order: sqlite, postgres, clickhouse, cube
const ROWS: { s: string; fit: [Fit, Fit, Fit, Fit]; why: string }[] = [
  { s: 'Local storage in a mobile / desktop app', fit: [3, 0, 0, 0], why: 'Needs to live inside the app and work offline — that is exactly SQLite.' },
  { s: 'Prototype, tests, single-user tool', fit: [3, 2, 0, 0], why: 'Zero setup wins. Postgres is fine too if production will use it.' },
  { s: 'Web app: users, orders, payments', fit: [1, 3, 0, 0], why: 'Many concurrent writers, constraints and transactions → Postgres.' },
  { s: 'Bank-style transfers (strict ACID)', fit: [1, 3, 0, 0], why: 'Multi-row transactions with isolation are core OLTP; ClickHouse has no real transactions.' },
  { s: 'Internal reports on ≤ 50M rows', fit: [1, 2, 2, 1], why: 'Postgres with indexes or a read replica often suffices; ClickHouse once queries get slow.' },
  { s: 'Product analytics over billions of events', fit: [0, 0, 3, 2], why: 'Columnar scans and compression; Cube adds pre-aggregations and shared metric definitions.' },
  { s: 'Logs, metrics, observability', fit: [0, 1, 3, 1], why: 'Append-heavy, time-ordered, aggregated — ClickHouse’s home turf.' },
  { s: 'Customer-facing embedded analytics', fit: [0, 1, 2, 3], why: 'Cube gives per-tenant security, caching and APIs on top of the warehouse.' },
  { s: 'One “revenue” number across BI, apps and AI', fit: [0, 0, 1, 3], why: 'That is the definition of a semantic layer.' },
]

// Sequential blue, stepped for the dark surface: brighter = better fit.
const FILL = ['#232322', '#184f95', '#2a78d6', '#86b6ef']
const INK = ['#898781', '#f0efec', '#ffffff', '#0b0b0b']
const WORD = ['—', 'meh', 'good', 'great']

export function FitMatrix() {
  const [hover, setHover] = useState<number | null>(null)
  const row = hover === null ? null : ROWS[hover]

  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-[2px] text-sm">
          <thead>
            <tr>
              <th className="text-left font-normal text-muted">Scenario</th>
              {TOOL_IDS.map((id) => (
                <th key={id} className="w-24 pb-2 text-center font-medium text-ink">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={id === 'cube' ? { border: '1.5px dashed #c3c2b7' } : { background: TOOLS[id].color }}
                    />
                    {TOOLS[id].name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr
                key={r.s}
                tabIndex={0}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="outline-none"
              >
                <td className={`py-1 pr-3 transition-colors ${hover === i ? 'text-ink' : 'text-ink-2'}`}>{r.s}</td>
                {r.fit.map((f, j) => (
                  <td
                    key={j}
                    className="rounded-[4px] text-center text-xs font-medium transition-[filter]"
                    style={{ background: FILL[f], color: INK[f], filter: hover === null || hover === i ? 'none' : 'brightness(0.6)' }}
                  >
                    {WORD[f]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 min-h-10 text-sm text-ink-2" aria-live="polite">
        {row ? row.why : <span className="text-muted">Hover a row to see why.</span>}
      </p>
    </div>
  )
}
