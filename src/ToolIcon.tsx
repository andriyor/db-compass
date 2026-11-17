import { siApachekafka, siClickhouse, siDuckdb, siMysql, siPostgresql, siSqlite, siTimescale } from 'simple-icons'
import type { ToolId } from './tools.ts'

// Cube has no Simple Icons entry, so a plain isometric cube outline stands in.
const CUBE = 'M12 1.5 21.5 7v10L12 22.5 2.5 17V7zm0 2.3L5.4 7.6 12 11.4l6.6-3.8zM4.5 9.3v6.6l6.5 3.8v-6.6zm15 0L13 13.1v6.6l6.5-3.8z'

const PATHS: Record<ToolId | 'kafka', string> = {
  sqlite: siSqlite.path,
  postgres: siPostgresql.path,
  mysql: siMysql.path,
  timescale: siTimescale.path,
  clickhouse: siClickhouse.path,
  duckdb: siDuckdb.path,
  cube: CUBE,
  kafka: siApachekafka.path,
}

// Works both in HTML and nested inside another <svg> (x/y position it there).
export function ToolIcon({ id, size = 16, x, y, className }: { id: ToolId | 'kafka'; size?: number; x?: number; y?: number; className?: string }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d={PATHS[id]} fillRule="evenodd" />
    </svg>
  )
}
