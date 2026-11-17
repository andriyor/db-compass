import { useState } from 'react'

const COLS = ['id', 'user', 'item', 'amount', 'date']
const ROWS = 8
const PAGE = 8 // cells per disk page
const DATA = Array.from({ length: ROWS }, (_, r) => [
  String(r + 1),
  ['ann', 'bob', 'cy', 'dee', 'eli', 'fay', 'gus', 'hal'][r],
  ['mug', 'pen', 'hat', 'cap', 'cup', 'bag', 'ink', 'tee'][r],
  String([12, 40, 7, 25, 9, 33, 18, 5][r]),
  `11-${String(r + 3).padStart(2, '0')}`,
])

const QUERIES = {
  point: {
    label: 'OLTP · fetch order #6',
    sql: 'SELECT * FROM orders WHERE id = 6',
    needs: (r: number) => r === 5,
  },
  scan: {
    label: 'OLAP · total revenue',
    sql: 'SELECT sum(amount) FROM orders',
    needs: (_r: number, c: number) => c === 3,
  },
} as const
type QueryId = keyof typeof QUERIES

type Layout = 'row' | 'column'
// Position of a cell on disk for each layout.
const pos = (layout: Layout, r: number, c: number) => (layout === 'row' ? r * COLS.length + c : c * ROWS + r)

export function StorageDemo() {
  const [q, setQ] = useState<QueryId>('point')
  const query = QUERIES[q]
  const needed = (r: number, c: number) => query.needs(r, c)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Query">
        {(Object.keys(QUERIES) as QueryId[]).map((id) => (
          <button
            key={id}
            role="radio"
            aria-checked={q === id}
            onClick={() => setQ(id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              q === id ? 'border-ink bg-ink text-page' : 'border-axis text-ink-2 hover:border-muted'
            }`}
          >
            {QUERIES[id].label}
          </button>
        ))}
        <code className="ml-auto rounded-md bg-raised px-3 py-1.5 font-mono text-xs text-ink-2">{query.sql}</code>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <LogicalTable needed={needed} />
        <div className="space-y-5">
          {(['row', 'column'] as Layout[]).map((l) => (
            <DiskStrip key={l} layout={l} needed={needed} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LogicalTable({ needed }: { needed: (r: number, c: number) => boolean }) {
  return (
    <figure className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
      <figcaption className="mb-3 text-xs uppercase tracking-wide text-muted">The table you think about</figcaption>
      <table className="w-full font-mono text-xs">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th key={c} className="pb-2 text-left font-medium text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DATA.map((row, r) => (
            <tr key={r}>
              {row.map((v, c) => (
                <td key={c} className="py-0.5 pr-1">
                  <span
                    className={`block rounded px-1.5 py-1 transition-colors duration-300 ${
                      needed(r, c) ? 'bg-ink text-page' : 'text-ink-2'
                    }`}
                  >
                    {v}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

function DiskStrip({ layout, needed }: { layout: Layout; needed: (r: number, c: number) => boolean }) {
  const total = ROWS * COLS.length
  const pages = total / PAGE
  const cells = Array.from({ length: total }, () => ({ r: 0, c: 0 }))
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS.length; c++) cells[pos(layout, r, c)] = { r, c }
  const pageRead = Array.from({ length: pages }, (_, p) =>
    cells.slice(p * PAGE, p * PAGE + PAGE).some(({ r, c }) => needed(r, c)),
  )
  const read = pageRead.filter(Boolean).length
  const useful = cells.filter(({ r, c }) => needed(r, c)).length

  const W = 600
  const gap = 10
  const pw = (W - gap * (pages - 1)) / pages
  const cw = pw / PAGE

  return (
    <figure className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium">
          {layout === 'row' ? 'Row store' : 'Column store'}
          <span className="ml-2 text-xs font-normal text-muted">
            {layout === 'row' ? 'SQLite, PostgreSQL, MySQL' : 'ClickHouse, DuckDB'}
          </span>
        </span>
        <span className="text-sm tabular-nums text-ink-2">
          <span className="text-2xl font-semibold text-ink">{read}</span> / {pages} pages read
          <span className="ml-2 text-xs text-muted">
            ({Math.round((useful / (read * PAGE)) * 100)}% of bytes useful)
          </span>
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} 74`} className="w-full" role="img" aria-label={`${layout} store: ${read} of ${pages} pages read`}>
        {pageRead.map((isRead, p) => {
          const x = p * (pw + gap)
          return (
            <g key={p}>
              <rect
                x={x - 3}
                y={2}
                width={pw + 6}
                height={46}
                rx={8}
                fill={isRead ? 'rgba(240,239,236,0.08)' : 'none'}
                stroke={isRead ? '#f0efec' : '#383835'}
                strokeWidth={isRead ? 1.5 : 1}
                className="transition-all duration-300"
              />
              {cells.slice(p * PAGE, p * PAGE + PAGE).map(({ r, c }, i) => (
                <g key={i}>
                  <rect
                    x={x + i * cw + 1}
                    y={10}
                    width={cw - 2}
                    height={30}
                    rx={3}
                    fill={needed(r, c) ? '#f0efec' : isRead ? '#52514e' : '#2c2c2a'}
                    className="transition-colors duration-300"
                  >
                    <title>{`${COLS[c]} of row ${r + 1}`}</title>
                  </rect>
                  <text
                    x={x + i * cw + cw / 2}
                    y={29}
                    textAnchor="middle"
                    fontSize={8}
                    className="pointer-events-none font-mono"
                    fill={needed(r, c) ? '#0b0b0b' : '#898781'}
                  >
                    {COLS[c][0]}
                    {r + 1}
                  </text>
                </g>
              ))}
              <text x={x + pw / 2} y={66} textAnchor="middle" fontSize={11} fill="#898781">
                page {p + 1}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
