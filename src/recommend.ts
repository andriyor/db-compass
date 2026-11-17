import type { ToolId } from './tools.ts'

export type Answers = {
  workload: 'transactions' | 'mixed' | 'analytics'
  deployment: 'embedded' | 'server'
  writers: 'one' | 'many'
  size: 0 | 1 | 2 | 3 // <1 GB, ~10s GB, ~100s GB, TB+
  consumers: 'app' | 'bi'
}

export type Score = { id: ToolId; score: number; why: string[] }

// shortcut: hand-tuned heuristic weights for teaching, not a benchmark.
export function recommend(a: Answers): Score[] {
  const s: Record<ToolId, Score> = {
    sqlite: { id: 'sqlite', score: 50, why: [] },
    postgres: { id: 'postgres', score: 55, why: [] },
    mysql: { id: 'mysql', score: 50, why: [] },
    clickhouse: { id: 'clickhouse', score: 30, why: [] },
    duckdb: { id: 'duckdb', score: 30, why: [] },
    cube: { id: 'cube', score: 10, why: [] },
  }
  const add = (id: ToolId, n: number, why: string) => {
    s[id].score += n
    s[id].why.push((n > 0 ? '+ ' : '− ') + why)
  }

  if (a.deployment === 'embedded') {
    add('sqlite', 40, 'Runs in-process from a single file — nothing to deploy')
    add('postgres', -35, 'Needs a server process; awkward inside a client app')
    add('mysql', -35, 'Needs a server process; awkward inside a client app')
    add('clickhouse', -35, 'A server/cluster, not something you embed')
    add('duckdb', 35, 'Runs in-process, like SQLite, but stores columns')
  } else {
    add('sqlite', -15, 'Shared over a network by many servers is not its job')
    add('duckdb', -10, 'No server mode for many remote clients')
  }

  if (a.workload === 'transactions') {
    add('postgres', 30, 'Row store + MVCC + constraints: built for OLTP')
    add('mysql', 30, 'Row store with InnoDB transactions: built for OLTP')
    add('sqlite', 10, 'Full ACID transactions')
    add('clickhouse', -40, 'Column store: single-row updates and transactions are weak')
    add('cube', -20, 'Nothing to model — no analytics in this workload')
    add('duckdb', -35, 'Column store: not built for many small updates')
  } else if (a.workload === 'mixed') {
    add('postgres', 20, 'Handles CRUD and moderate reporting in one place')
    add('mysql', 10, 'Fine for CRUD; weaker than Postgres at complex reporting SQL')
    add('clickhouse', 10, 'Offload heavy reports here when Postgres gets slow')
    add('cube', 10, 'Can cache reporting queries on top of Postgres')
  } else {
    add('clickhouse', 40, 'Columnar scans + compression make aggregations fast')
    add('duckdb', 35, 'Vectorised columnar engine for aggregations')
    add('cube', 20, 'Pre-aggregations make repeated dashboard queries instant')
    add('postgres', -10, 'Row store reads whole rows even when you need one column')
    add('mysql', -15, 'Row store reads whole rows even when you need one column')
    add('sqlite', -15, 'Single-threaded scans over large data')
  }

  if (a.writers === 'many') {
    add('sqlite', -30, 'One writer at a time locks the whole file')
    add('postgres', 10, 'Many concurrent writers with row-level locking')
    add('mysql', 10, 'Many concurrent writers with row-level locking')
    add('duckdb', -25, 'One writing process at a time')
  }

  if (a.size >= 2) {
    add('clickhouse', a.size === 3 ? 30 : 15, 'Shines as data grows to hundreds of GB and beyond')
    add('sqlite', a.size === 3 ? -40 : -15, 'Single file on a single disk')
    if (a.size === 3) add('duckdb', -25, 'Bound to one machine; TB-scale shared data wants a cluster')
    if (a.workload !== 'transactions') {
      add('postgres', a.size === 3 ? -30 : -10, 'Analytical scans slow down at this size')
      add('mysql', a.size === 3 ? -30 : -10, 'Analytical scans slow down at this size')
    }
  } else if (a.size === 0) {
    add('clickhouse', -15, 'Overkill for small data')
    add('duckdb', 10, 'Small data: no server needed for fast analytics')
  }

  if (a.consumers === 'bi') {
    add('cube', 45, 'Many dashboards/teams need one consistent metric definition')
  } else {
    add('cube', -10, 'Only your own app reads the data')
  }

  return Object.values(s)
    .map((x) => ({ ...x, score: Math.max(0, Math.min(100, x.score)) }))
    .sort((x, y) => y.score - x.score)
}

// Position of "your project" on the Landscape map (0..1 axes).
export function markerFor(a: Answers) {
  const x = { transactions: 0.16, mixed: 0.5, analytics: 0.84 }[a.workload]
  const y = a.deployment === 'embedded' ? 0.08 : [0.38, 0.48, 0.62, 0.86][a.size]
  return { x, y }
}
