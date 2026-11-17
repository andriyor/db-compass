import type { CSSProperties } from 'react'

export type ToolId = 'sqlite' | 'postgres' | 'clickhouse' | 'duckdb' | 'cube'

export type Tool = {
  name: string
  color: string
  kind: string
  tagline: string
  use: string[]
  avoid: string[]
}

// Categorical slots 1–3 (validated all-pairs on the dark surface). No 4th hue passes
// all-pairs, so DuckDB is neutral + hatched and Cube neutral + dashed outline.
export const TOOLS: Record<ToolId, Tool> = {
  sqlite: {
    name: 'SQLite',
    color: '#199e70',
    kind: 'Embedded OLTP · a library, not a server',
    tagline: 'One file, zero setup, lives inside your app.',
    use: ['Mobile, desktop and edge apps', 'Prototypes, tests, CLIs, single-user tools', 'Read-heavy sites with one writer'],
    avoid: ['Many concurrent writers', 'Data shared by many servers over a network', 'Scanning billions of rows'],
  },
  postgres: {
    name: 'PostgreSQL',
    color: '#3987e5',
    kind: 'Server OLTP · row store',
    tagline: 'The default system of record for your application.',
    use: ['Users, orders, payments — anything CRUD', 'Strict transactions and constraints', 'Moderate reporting with good indexes'],
    avoid: ['Aggregating billions of events interactively', 'Embedding inside a client app'],
  },
  clickhouse: {
    name: 'ClickHouse',
    color: '#d95926',
    kind: 'Server OLAP · column store',
    tagline: 'Scans billions of rows in seconds.',
    use: ['Product analytics, events, clickstreams', 'Logs, metrics, observability', 'Aggregations over huge append-only data'],
    avoid: ['Frequent single-row updates/deletes', 'Transactions across rows', 'Being your primary app database'],
  },
  duckdb: {
    name: 'DuckDB',
    color: '#c3c2b7',
    kind: 'Embedded OLAP · column store, in-process',
    tagline: 'The SQLite of analytics: columnar SQL inside your process.',
    use: ['Analysing CSV / Parquet files on a laptop', 'Notebooks, data pipelines, local BI', 'Fast aggregations without running a server'],
    avoid: ['Many concurrent writers', 'Serving dashboards to many users at once', 'Being your app’s transactional database'],
  },
  cube: {
    name: 'Cube',
    color: '#c3c2b7',
    kind: 'Semantic layer · sits on top of a database',
    tagline: 'Define “revenue” once; serve it everywhere, cached.',
    use: ['One definition of metrics for BI, apps and AI', 'Pre-aggregations so dashboards are instant', 'REST / GraphQL / SQL APIs with access control'],
    avoid: ['Storing data — it needs Postgres, ClickHouse, etc. beneath', 'Plain CRUD apps with no analytics'],
  },
}

export const TOOL_IDS = Object.keys(TOOLS) as ToolId[]

const HATCH = 'repeating-linear-gradient(45deg,#c3c2b7 0 2px,transparent 2px 5px)'
// Legend swatch / bar fill per tool: hue for the three databases, texture or outline for the rest.
export const swatch = (id: ToolId): CSSProperties =>
  id === 'cube'
    ? { border: '1.5px dashed #c3c2b7' }
    : id === 'duckdb'
      ? { background: HATCH, boxShadow: 'inset 0 0 0 1.5px #c3c2b7' }
      : { background: TOOLS[id].color }
