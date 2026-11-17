import { useState } from 'react'

type Path = 'oltp' | 'olap' | 'stream'
type Node = { id: string; x: number; y: number; title: string; sub: string; color?: string; dashed?: boolean; log?: boolean; kafka?: boolean; path: Path[] }

const N = '#c3c2b7' // neutral ink: Kafka and Cube are not databases, so no categorical hue
const NODES: Node[] = [
  { id: 'mobile', x: 20, y: 40, title: 'Mobile app', sub: 'offline-first', path: ['oltp'] },
  { id: 'web', x: 20, y: 190, title: 'Web / API', sub: 'users click “Buy”', path: ['oltp'] },
  { id: 'events', x: 20, y: 340, title: 'Event producers', sub: 'clicks, logs, IoT', path: ['olap', 'stream'] },
  { id: 'sqlite', x: 270, y: 40, title: 'SQLite', sub: 'on the device', color: '#199e70', path: ['oltp'] },
  { id: 'pg', x: 270, y: 190, title: 'PostgreSQL', sub: 'system of record', color: '#3987e5', path: ['oltp', 'olap', 'stream'] },
  { id: 'kafka', x: 500, y: 265, title: 'Kafka', sub: 'durable event log', color: N, log: true, kafka: true, path: ['olap', 'stream'] },
  { id: 'ch', x: 730, y: 265, title: 'ClickHouse', sub: 'analytics warehouse', color: '#d95926', path: ['olap', 'stream'] },
  { id: 'services', x: 730, y: 410, title: 'Other services', sub: 'search, email, fraud', kafka: true, path: ['stream'] },
  { id: 'cube', x: 960, y: 265, title: 'Cube', sub: 'metrics + cache', color: N, dashed: true, path: ['olap'] },
  { id: 'bi', x: 1190, y: 190, title: 'Dashboards', sub: 'BI tools', path: ['olap'] },
  { id: 'emb', x: 1190, y: 340, title: 'Apps & AI agents', sub: 'REST · GraphQL · SQL', path: ['olap'] },
]
const NW = 150
const NH = 64

// when: shown only with Kafka on ('kafka') or off ('direct'); unset = always.
const EDGES: { from: string; to: string; label: string; path: Path[]; color: string; when?: 'kafka' | 'direct' }[] = [
  { from: 'mobile', to: 'sqlite', label: 'local', path: ['oltp'], color: '#199e70' },
  { from: 'sqlite', to: 'pg', label: 'sync', path: ['oltp'], color: '#199e70' },
  { from: 'web', to: 'pg', label: 'writes', path: ['oltp'], color: '#3987e5' },
  { from: 'pg', to: 'kafka', label: 'CDC (Debezium)', path: ['olap', 'stream'], color: '#3987e5', when: 'kafka' },
  { from: 'events', to: 'kafka', label: 'produce', path: ['olap', 'stream'], color: N, when: 'kafka' },
  { from: 'kafka', to: 'ch', label: 'consume', path: ['olap', 'stream'], color: N, when: 'kafka' },
  { from: 'kafka', to: 'services', label: 'consume', path: ['stream'], color: N, when: 'kafka' },
  { from: 'pg', to: 'ch', label: 'CDC / ETL', path: ['olap'], color: '#3987e5', when: 'direct' },
  { from: 'events', to: 'ch', label: 'append', path: ['olap'], color: N, when: 'direct' },
  { from: 'ch', to: 'cube', label: 'SQL', path: ['olap'], color: '#d95926' },
  { from: 'cube', to: 'bi', label: '', path: ['olap'], color: N },
  { from: 'cube', to: 'emb', label: '', path: ['olap'], color: N },
]

function edgePath(a: Node, b: Node) {
  const x1 = a.x + NW
  const y1 = a.y + NH / 2
  const x2 = b.x
  const y2 = b.y + NH / 2
  if (a.x === b.x) return `M${a.x + NW / 2} ${a.y + NH} L${b.x + NW / 2} ${b.y}`
  const mx = (x1 + x2) / 2
  return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
}

const MODES: { id: Path | 'all'; label: string; note: string }[] = [
  { id: 'all', label: 'Whole system', note: 'Most real products use both sides: a row store to run the business, a column store to understand it.' },
  { id: 'oltp', label: 'OLTP path', note: 'Thousands of tiny, concurrent reads and writes. Each touches a few rows and must be correct right now.' },
  { id: 'olap', label: 'OLAP path', note: 'Data is copied out, appended in bulk and scanned in big aggregations. A few minutes of delay is usually fine.' },
  { id: 'stream', label: 'Streaming path', note: 'Kafka is an append-only log, not a database you query. Producers write each event once; any number of consumers read it at their own pace and can replay from any offset. It decouples the systems, so ClickHouse can lag or restart without slowing Postgres down.' },
]

export function Pipeline() {
  const [mode, setMode] = useState<Path | 'all'>('all')
  const [kafka, setKafka] = useState(false)
  // Without Kafka its column disappears, so everything right of it moves left by one column.
  const nodes = kafka ? NODES : NODES.filter((n) => !n.kafka).map((n) => (n.x > 500 ? { ...n, x: n.x - 230 } : n))
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const edges = EDGES.filter((e) => !e.when || e.when === (kafka ? 'kafka' : 'direct'))
  const modes = MODES.filter((m) => kafka || m.id !== 'stream')
  const W = kafka ? 1360 : 1130
  const H = kafka ? 500 : 430
  const toggleKafka = () => {
    setKafka(!kafka)
    setMode(kafka ? 'all' : 'stream')
  }
  const on = (p: Path[] | Path) => mode === 'all' || (Array.isArray(p) ? p.includes(mode) : p === mode)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              mode === m.id ? 'border-ink bg-ink text-page' : 'border-axis text-ink-2 hover:border-muted'
            }`}
          >
            {m.label}
          </button>
        ))}
        <button
          aria-pressed={kafka}
          onClick={toggleKafka}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-axis px-3 py-1.5 text-sm text-ink-2 transition hover:border-muted"
        >
          <span className={`relative h-4 w-7 rounded-full transition-colors ${kafka ? 'bg-ink' : 'bg-axis'}`}>
            <span className={`absolute top-0.5 size-3 rounded-full bg-page transition-all ${kafka ? 'left-3.5' : 'left-0.5'}`} />
          </span>
          Stream through Kafka
        </button>
      </div>
      <p className="text-sm text-ink-2">{modes.find((m) => m.id === mode)!.note}</p>
      <div className="overflow-x-auto rounded-xl bg-surface p-3 ring-1 ring-white/10">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[760px]" role="img" aria-label="Typical data architecture from app databases to analytics">
          {edges.map((e) => {
            const d = edgePath(byId[e.from], byId[e.to])
            const lit = on(e.path)
            return (
              <g key={e.from + e.to} style={{ opacity: lit ? 1 : 0.15 }} className="transition-opacity duration-300">
                <path d={d} fill="none" stroke="#383835" strokeWidth={2} />
                <path d={d} fill="none" stroke={e.color} strokeWidth={2} className="flow" />
                {lit && (
                  <circle r={4} fill={e.color}>
                    <animateMotion dur="2.4s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
                {e.label && <EdgeLabel a={byId[e.from]} b={byId[e.to]} text={e.label} />}
              </g>
            )
          })}
          {nodes.map((n) => (
            <g key={n.id} style={{ opacity: on(n.path) ? 1 : 0.2 }} className="transition-opacity duration-300">
              <rect
                x={n.x}
                y={n.y}
                width={NW}
                height={NH}
                rx={12}
                fill={n.color && !n.dashed ? n.color : '#232322'}
                fillOpacity={n.color && !n.dashed ? 0.18 : 1}
                stroke={n.color ?? '#383835'}
                strokeWidth={n.color ? 1.5 : 1}
                strokeDasharray={n.dashed ? '6 5' : undefined}
              />
              {n.color && <rect x={n.x} y={n.y + 14} width={4} height={NH - 28} rx={2} fill={n.color} />}
              <text x={n.x + 16} y={n.y + 28} fontSize={15} fontWeight={600} fill="#f0efec">{n.title}</text>
              <text x={n.x + 16} y={n.y + 47} fontSize={12} fill="#898781">{n.sub}</text>
              {n.log && <LogTape x={n.x} y={n.y + NH + 8} />}
            </g>
          ))}
          <text x={270} y={H - 10} fontSize={11} fill="#898781" letterSpacing="0.1em">◀ OLTP · run the business</text>
          <text x={W - 20} y={H - 10} fontSize={11} fill="#898781" letterSpacing="0.1em" textAnchor="end">understand the business · OLAP ▶</text>
        </svg>
      </div>
    </div>
  )
}

function EdgeLabel({ a, b, text }: { a: Node; b: Node; text: string }) {
  const vertical = a.x === b.x
  const x = vertical ? a.x + NW / 2 + 8 : (a.x + NW + b.x) / 2
  const y = vertical ? (a.y + NH + b.y) / 2 + 4 : (a.y + b.y + NH) / 2 - 8
  return (
    <text x={x} y={y} fontSize={11} fill="#c3c2b7" textAnchor={vertical ? 'start' : 'middle'} paintOrder="stroke" stroke="#1a1a19" strokeWidth={4}>
      {text}
    </text>
  )
}

// Kafka's partition as a tape of messages: new ones keep landing at the end.
function LogTape({ x, y }: { x: number; y: number }) {
  const cells = 9
  const w = 14
  return (
    <g aria-hidden>
      {Array.from({ length: cells }, (_, i) => (
        <rect
          key={i}
          x={x + i * (w + 2)}
          y={y}
          width={w}
          height={12}
          rx={2}
          fill="#c3c2b7"
          className="append"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <text x={x} y={y + 26} fontSize={10} fill="#898781">
        offset 0 → … append only
      </text>
    </g>
  )
}
