import { test } from 'node:test'
import assert from 'node:assert/strict'
import { recommend, type Answers } from './recommend.ts'

const top = (a: Answers) => recommend(a)[0].id

test('local app with small data → SQLite', () => {
  assert.equal(top({ workload: 'transactions', deployment: 'embedded', writers: 'one', size: 0, consumers: 'app' }), 'sqlite')
})
test('web app with many writers → Postgres', () => {
  assert.equal(top({ workload: 'transactions', deployment: 'server', writers: 'many', size: 1, consumers: 'app' }), 'postgres')
})
test('TB of events → ClickHouse', () => {
  assert.equal(top({ workload: 'analytics', deployment: 'server', writers: 'many', size: 3, consumers: 'app' }), 'clickhouse')
})
test('shared dashboards over big data → ClickHouse + Cube in top two', () => {
  const ids = recommend({ workload: 'analytics', deployment: 'server', writers: 'many', size: 3, consumers: 'bi' }).slice(0, 2).map((s) => s.id)
  assert.deepEqual(ids.sort(), ['clickhouse', 'cube'])
})
test('scores stay within 0..100', () => {
  for (const s of recommend({ workload: 'analytics', deployment: 'embedded', writers: 'many', size: 3, consumers: 'app' }))
    assert.ok(s.score >= 0 && s.score <= 100)
})
