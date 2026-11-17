import { test } from 'node:test'
import assert from 'node:assert/strict'
import { recommend, type Answers } from './recommend.ts'

const top = (a: Answers) => recommend(a)[0].id

test('local app with small data → SQLite', () => {
  assert.equal(top({ timeseries: 'no', workload: 'transactions', deployment: 'embedded', writers: 'one', size: 0, consumers: 'app' }), 'sqlite')
})
test('web app with many writers → Postgres', () => {
  assert.equal(top({ timeseries: 'no', workload: 'transactions', deployment: 'server', writers: 'many', size: 1, consumers: 'app' }), 'postgres')
})
test('web app: Postgres first, MySQL a close second', () => {
  const ids = recommend({ timeseries: 'no', workload: 'transactions', deployment: 'server', writers: 'many', size: 1, consumers: 'app' }).map((s) => s.id)
  assert.deepEqual(ids.slice(0, 2), ['postgres', 'mysql'])
})
test('TB of events → ClickHouse', () => {
  assert.equal(top({ timeseries: 'no', workload: 'analytics', deployment: 'server', writers: 'many', size: 3, consumers: 'app' }), 'clickhouse')
})
test('shared dashboards over big data → ClickHouse + Cube in top two', () => {
  const ids = recommend({ timeseries: 'no', workload: 'analytics', deployment: 'server', writers: 'many', size: 3, consumers: 'bi' }).slice(0, 2).map((s) => s.id)
  assert.deepEqual(ids.sort(), ['clickhouse', 'cube'])
})
test('analytics on a laptop → DuckDB', () => {
  assert.equal(top({ timeseries: 'no', workload: 'analytics', deployment: 'embedded', writers: 'one', size: 1, consumers: 'app' }), 'duckdb')
})
test('sensor readings, mixed workload → TimescaleDB', () => {
  assert.equal(top({ timeseries: 'yes', workload: 'mixed', deployment: 'server', writers: 'many', size: 2, consumers: 'app' }), 'timescale')
})
test('scores stay within 0..100', () => {
  for (const s of recommend({ timeseries: 'no', workload: 'analytics', deployment: 'embedded', writers: 'many', size: 3, consumers: 'app' }))
    assert.ok(s.score >= 0 && s.score <= 100)
})
