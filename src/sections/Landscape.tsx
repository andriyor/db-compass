import { useState } from 'react'
import { swatch, TOOLS, type ToolId } from '../tools.ts'

const W = 760
const H = 470
const M = { l: 70, r: 20, t: 90, b: 56 }
const pw = W - M.l - M.r
const ph = H - M.t - M.b
const X = (v: number) => M.l + v * pw
const Y = (v: number) => M.t + (1 - v) * ph

const REGIONS: { id: Exclude<ToolId, 'cube'>; cx: number; cy: number; rx: number; ry: number; lx: number; ly: number }[] = [
  { id: 'sqlite', cx: 0.17, cy: 0.15, rx: 0.14, ry: 0.11, lx: 0.2, ly: 0.18 },
  { id: 'postgres', cx: 0.33, cy: 0.47, rx: 0.22, ry: 0.19, lx: 0.36, ly: 0.56 },
  { id: 'clickhouse', cx: 0.78, cy: 0.64, rx: 0.19, ry: 0.27, lx: 0.76, ly: 0.75 },
  { id: 'duckdb', cx: 0.78, cy: 0.15, rx: 0.17, ry: 0.11, lx: 0.74, ly: 0.18 },
]

export function Landscape({ marker }: { marker: { x: number; y: number } }) {
  const [active, setActive] = useState<ToolId>('postgres')
  const tool = TOOLS[active]
  const bind = (id: ToolId) => ({
    onMouseEnter: () => setActive(id),
    onFocus: () => setActive(id),
    onClick: () => setActive(id),
    tabIndex: 0,
    role: 'button',
    'aria-label': TOOLS[id].name,
    className: 'cursor-pointer outline-none',
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
      <div className="rounded-xl bg-surface p-3 ring-1 ring-white/10">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Map of databases by workload and scale">
          <defs>
            <linearGradient id="split" x1="0" x2="1">
              <stop offset="0" stopColor="#3987e5" stopOpacity="0.07" />
              <stop offset="0.5" stopColor="#1a1a19" stopOpacity="0" />
              <stop offset="1" stopColor="#d95926" stopOpacity="0.07" />
            </linearGradient>
            <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#c3c2b7" fillOpacity="0.06" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#c3c2b7" strokeOpacity="0.45" strokeWidth="2" />
            </pattern>
          </defs>
          <rect x={M.l} y={M.t} width={pw} height={ph} fill="url(#split)" />
          {[0.25, 0.5, 0.75].map((v) => (
            <g key={v}>
              <line x1={X(v)} x2={X(v)} y1={M.t} y2={M.t + ph} stroke="#2c2c2a" />
              <line x1={M.l} x2={M.l + pw} y1={Y(v)} y2={Y(v)} stroke="#2c2c2a" />
            </g>
          ))}
          <line x1={M.l} x2={M.l + pw} y1={M.t + ph} y2={M.t + ph} stroke="#383835" />
          <line x1={M.l} x2={M.l} y1={M.t} y2={M.t + ph} stroke="#383835" />
          <text x={X(0.02)} y={Y(0.96)} fontSize={13} fontWeight={600} fill="#898781" letterSpacing="0.1em">OLTP</text>
          <text x={X(0.98)} y={Y(0.96)} fontSize={13} fontWeight={600} fill="#898781" textAnchor="end" letterSpacing="0.1em">OLAP</text>

          {/* x axis */}
          {[
            [0, 'Point reads & writes', 'start'],
            [0.5, 'Mixed', 'middle'],
            [1, 'Huge scans & aggregations', 'end'],
          ].map(([v, t, a]) => (
            <text key={t} x={X(v as number)} y={H - 32} fontSize={12} fill="#898781" textAnchor={a as 'start'}>
              {t}
            </text>
          ))}
          <text x={X(0.5)} y={H - 10} fontSize={12} fill="#c3c2b7" textAnchor="middle">Workload →</text>
          {/* y axis */}
          {[
            [0.06, 'device'],
            [0.5, 'server'],
            [0.94, 'cluster'],
          ].map(([v, t]) => (
            <text key={t} x={M.l - 10} y={Y(v as number) + 4} fontSize={12} fill="#898781" textAnchor="end">
              {t}
            </text>
          ))}
          <text transform={`translate(18 ${Y(0.5)}) rotate(-90)`} fontSize={12} fill="#c3c2b7" textAnchor="middle">
            Scale →
          </text>

          {/* Cube: a layer above the stores, not a point among them */}
          <g {...bind('cube')}>
            <rect
              x={X(0.18)}
              y={14}
              width={X(0.98) - X(0.18)}
              height={44}
              rx={10}
              fill={active === 'cube' ? 'rgba(195,194,183,0.12)' : 'rgba(195,194,183,0.04)'}
              stroke="#c3c2b7"
              strokeDasharray="6 5"
              strokeWidth={active === 'cube' ? 2 : 1.2}
            />
            <text x={X(0.58)} y={34} fontSize={14} fontWeight={600} fill="#f0efec" textAnchor="middle">
              Cube · semantic layer
            </text>
            <text x={X(0.58)} y={50} fontSize={11} fill="#c3c2b7" textAnchor="middle">
              metrics · caching · APIs — reads from the databases below
            </text>
            {[0.33, 0.78].map((v) => (
              <line key={v} x1={X(v)} x2={X(v)} y1={58} y2={Y(v === 0.33 ? 0.66 : 0.91)} stroke="#c3c2b7" strokeDasharray="3 4" className="flow" />
            ))}
          </g>

          {REGIONS.map((r) => {
            const t = TOOLS[r.id]
            const on = active === r.id
            return (
              <g key={r.id} {...bind(r.id)}>
                <ellipse
                  cx={X(r.cx)}
                  cy={Y(r.cy)}
                  rx={r.rx * pw}
                  ry={r.ry * ph}
                  fill={r.id === 'duckdb' ? 'url(#hatch)' : t.color}
                  fillOpacity={r.id === 'duckdb' ? 1 : on ? 0.32 : 0.16}
                  stroke={t.color}
                  strokeWidth={on ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />
                <text x={X(r.lx)} y={Y(r.ly) + 5} fontSize={16} fontWeight={600} fill="#f0efec" textAnchor="middle" className="pointer-events-none">
                  {t.name}
                </text>
              </g>
            )
          })}

          {/* "your project" marker driven by the chooser */}
          <g style={{ transform: `translate(${X(marker.x)}px, ${Y(marker.y)}px)`, transition: 'transform 500ms cubic-bezier(.2,.8,.2,1)' }}>
            <circle r={14} fill="none" stroke="#f0efec" strokeOpacity={0.4} strokeWidth={2} />
            <circle r={6} fill="#f0efec" stroke="#1a1a19" strokeWidth={2} />
            <text x={18} y={4} fontSize={12} fill="#f0efec" fontWeight={600}>you</text>
          </g>
        </svg>
      </div>

      <aside className="rounded-xl bg-surface p-5 ring-1 ring-white/10" aria-live="polite">
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={swatch(active)}
          />
          <h3 className="text-lg font-semibold">{tool.name}</h3>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted">{tool.kind}</p>
        <p className="mt-3 text-ink-2">{tool.tagline}</p>
        <h4 className="mt-5 text-sm font-medium text-ink">Reach for it when</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
          {tool.use.map((u) => (
            <li key={u} className="flex gap-2"><span className="text-[#0ca30c]">✓</span>{u}</li>
          ))}
        </ul>
        <h4 className="mt-5 text-sm font-medium text-ink">Avoid for</h4>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
          {tool.avoid.map((u) => (
            <li key={u} className="flex gap-2"><span className="text-[#e66767]">✕</span>{u}</li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">Hover or tab through the map to switch.</p>
      </aside>
    </div>
  )
}
