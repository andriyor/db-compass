import { useState } from 'react'
import { ToolIcon } from '../ToolIcon.tsx'
import { swatch, TOOL_IDS, TOOLS } from '../tools.ts'

type Fit = 0 | 1 | 2 | 3
// order: sqlite, postgres, mysql, timescale, clickhouse, duckdb, cube
type Row = { s: string; fit: [Fit, Fit, Fit, Fit, Fit, Fit, Fit]; why: string }

const ROW_GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Running the app',
    rows: [
      { s: 'Local storage in a mobile / desktop app', fit: [3, 0, 0, 0, 0, 0, 0], why: 'Needs to live inside the app and work offline — that is exactly SQLite.' },
      { s: 'Prototype, tests, single-user tool', fit: [3, 2, 1, 0, 0, 2, 0], why: 'Zero setup wins. DuckDB if the tool is about analysing data; Postgres if production will use it.' },
      { s: 'Web app: users, orders, payments', fit: [1, 3, 3, 1, 0, 0, 0], why: 'Many concurrent writers, constraints and transactions → Postgres.' },
      { s: 'Bank-style transfers (strict ACID)', fit: [1, 3, 3, 1, 0, 0, 0], why: 'Multi-row transactions with isolation are core OLTP — Postgres and MySQL both do it; ClickHouse doesn’t.' },
      { s: 'Read-heavy site on cheap shared hosting', fit: [1, 2, 3, 0, 0, 0, 0], why: 'MySQL is the default on most shared hosts and CMSs like WordPress.' },
      { s: 'Rich types, JSON, geo (PostGIS), extensions', fit: [1, 3, 1, 2, 0, 0, 0], why: 'Postgres’s extension ecosystem is its biggest edge over MySQL.' },
    ],
  },
  {
    title: 'Time series',
    rows: [
      { s: 'IoT / sensor readings joined with app data', fit: [0, 1, 0, 3, 2, 0, 0], why: 'TimescaleDB keeps readings and devices/customers in one Postgres, partitioned by time and compressed.' },
      { s: 'Logs, metrics, observability', fit: [0, 1, 0, 2, 3, 1, 1], why: 'Append-heavy, time-ordered, aggregated — ClickHouse’s home turf; TimescaleDB at smaller scale (Prometheus for pure monitoring).' },
    ],
  },
  {
    title: 'Analytics',
    rows: [
      { s: 'Internal reports on ≤ 50M rows', fit: [1, 2, 1, 2, 2, 2, 1], why: 'Postgres or a read replica often suffices; DuckDB over an export for ad-hoc analysis; ClickHouse once it must be shared and fast.' },
      { s: 'Product analytics over billions of events', fit: [0, 0, 0, 1, 3, 1, 2], why: 'Columnar scans and compression; Cube adds pre-aggregations and shared metric definitions.' },
      { s: 'Customer-facing embedded analytics', fit: [0, 1, 0, 1, 2, 0, 3], why: 'Cube gives per-tenant security, caching and APIs on top of the warehouse.' },
      { s: 'One “revenue” number across BI, apps and AI', fit: [0, 0, 0, 0, 1, 0, 3], why: 'That is the definition of a semantic layer.' },
    ],
  },
]
const ROWS = ROW_GROUPS.flatMap((g) => g.rows)

// Columns follow TOOL_IDS order; each group starts a little apart from the previous one.
const COL_GROUPS = [
  { title: 'OLTP · row stores', span: 3 },
  { title: 'Time series', span: 1 },
  { title: 'OLAP · column stores', span: 2 },
  { title: 'Semantic layer', span: 1 },
]
const GROUP_STARTS = new Set(COL_GROUPS.slice(1).map((_, k) => COL_GROUPS.slice(0, k + 1).reduce((n, g) => n + g.span, 0)))
const gap = (j: number) => (GROUP_STARTS.has(j) ? 'pl-3' : '')

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
        <table className="w-full min-w-[960px] border-separate border-spacing-[2px] text-sm">
          <thead>
            <tr>
              <th />
              {COL_GROUPS.map((g, k) => (
                <th key={g.title} colSpan={g.span} className={`pb-1 align-bottom ${k ? 'pl-3' : ''}`}>
                  <span className="block border-b border-axis pb-1 text-[11px] font-normal tracking-wide whitespace-nowrap text-muted uppercase">
                    {g.title}
                  </span>
                </th>
              ))}
            </tr>
            <tr>
              <th className="text-left align-bottom font-normal text-muted">Scenario</th>
              {TOOL_IDS.map((id, j) => (
                <th key={id} className={`w-24 pt-2 pb-2 text-center font-medium text-ink ${gap(j)}`}>
                  <ToolIcon id={id} size={18} className="mx-auto mb-1" />
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={swatch(id)} />
                    {TOOLS[id].name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {ROW_GROUPS.map((g) => (
            <tbody key={g.title}>
              <tr>
                <td colSpan={TOOL_IDS.length + 1} className="pt-4 pb-1 text-xs font-medium tracking-wide text-muted uppercase">
                  {g.title}
                </td>
              </tr>
              {g.rows.map((r) => {
                const i = ROWS.indexOf(r)
                return (
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
                      <td key={j} className={`p-0 ${gap(j)}`}>
                        <div
                          className="rounded-[4px] py-1 text-center text-xs font-medium transition-[filter]"
                          style={{ background: FILL[f], color: INK[f], filter: hover === null || hover === i ? 'none' : 'brightness(0.6)' }}
                        >
                          {WORD[f]}
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          ))}
        </table>
      </div>
      <p className="mt-4 min-h-10 text-sm text-ink-2" aria-live="polite">
        {row ? row.why : <span className="text-muted">Hover a row to see why.</span>}
      </p>
    </div>
  )
}
