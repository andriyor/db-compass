export type ToolId = 'sqlite' | 'postgres' | 'clickhouse' | 'cube'

export type Tool = {
  name: string
  color: string
  kind: string
  tagline: string
  use: string[]
  avoid: string[]
}

// Categorical slots 1–3 (validated all-pairs on the dark surface). Cube is not a
// database, so it gets neutral ink + a dashed outline instead of a 4th hue.
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
