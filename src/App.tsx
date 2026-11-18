import { useState, type ReactNode } from 'react'
import { siGithub } from 'simple-icons'
import { markerFor, type Answers } from './recommend.ts'
import { ToolIcon } from './ToolIcon.tsx'
import { TOOL_IDS, TOOLS } from './tools.ts'
import { Chooser } from './sections/Chooser.tsx'
import { FitMatrix } from './sections/FitMatrix.tsx'
import { Landscape } from './sections/Landscape.tsx'
import { Pipeline } from './sections/Pipeline.tsx'
import { StorageDemo } from './sections/StorageDemo.tsx'

const CONCEPT = [
  ['Stands for', 'Online Transaction Processing', 'Online Analytical Processing'],
  ['Typical question', '“Show order #6”, “add item to cart”', '“Revenue by country per week”'],
  ['Rows per query', 'a handful', 'millions – billions'],
  ['Columns per query', 'all of them', 'a few'],
  ['Writes', 'constant small updates', 'bulk appends'],
  ['Latency goal', 'milliseconds', 'seconds is fine'],
  ['Storage layout', 'row by row', 'column by column, compressed'],
  ['Here', 'SQLite, PostgreSQL, MySQL', 'ClickHouse, DuckDB (+ Cube on top)'],
]

export default function App() {
  const [answers, setAnswers] = useState<Answers>({
    workload: 'transactions',
    timeseries: 'no',
    deployment: 'server',
    writers: 'many',
    size: 1,
    consumers: 'app',
  })

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="pt-16 pb-12">
        <div className="flex items-center justify-between text-sm font-medium tracking-wide text-muted">
          <p>DB COMPASS</p>
          <a
            href="https://github.com/andriyor/db-compass"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
              <path d={siGithub.path} />
            </svg>
            GitHub
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Run the business with <span className="text-pg">OLTP</span>.
          <br />
          Understand it with <span className="text-ch">OLAP</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2">
          When to reach for <b className="text-lite">SQLite</b>, <b className="text-pg">PostgreSQL</b>, <b className="text-ink">MySQL</b>, <b className="text-ink">TimescaleDB</b>,{' '}
          <b className="text-ch">ClickHouse</b>, <b className="text-ink">DuckDB</b> and <b className="text-ink">Cube</b> — explained by how data moves, not by feature lists.
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
          {/* databases only: Cube is a layer on top, Kafka a stream — both explained below */}
          {TOOL_IDS.filter((id) => id !== 'cube').map((id) => (
            <li key={id} className="flex items-center gap-2">
              <ToolIcon id={id} size={20} />
              {TOOLS[id].name}
            </li>
          ))}
        </ul>
      </header>

      <Section n="01" title="Two kinds of work" lead="Every database is tuned for one shape of query. Pick the shape first; the tool follows.">
        <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-3 text-left font-normal text-muted" />
                <th className="p-3 text-left font-semibold text-pg">OLTP</th>
                <th className="p-3 text-left font-semibold text-ch">OLAP</th>
              </tr>
            </thead>
            <tbody>
              {CONCEPT.map(([k, a, b]) => (
                <tr key={k} className="border-t border-grid">
                  <td className="p-3 text-muted">{k}</td>
                  <td className="p-3 text-ink-2">{a}</td>
                  <td className="p-3 text-ink-2">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        n="02"
        title="Why the storage layout decides it"
        lead="Disks read whole pages. Store rows together and one order is one page; store columns together and one metric across all orders is one page. Switch the query and count the pages."
      >
        <StorageDemo />
      </Section>

      <Section n="03" title="The map" lead="Workload left to right, scale bottom to top. Cube is drawn above the map because it is not a database — it is a layer that reads from them. Kafka is not on it at all: you stream through it, you don’t query it (see 05).">
        <Landscape marker={markerFor(answers)} />
      </Section>

      <Section n="04" title="Which one for my project?" lead="Answer six questions. The “you” dot on the map above moves with your answers.">
        <Chooser answers={answers} onChange={setAnswers} />
      </Section>

      <Section n="05" title="How they fit together" lead="They are not rivals. A typical product uses several, each doing the job it is shaped for. Switch on Kafka to see the conveyor belt between them: it moves data, it doesn’t answer queries.">
        <Pipeline />
      </Section>

      <Section n="06" title="Cheat sheet" lead="Common scenarios and how well each tool fits.">
        <FitMatrix />
      </Section>
    </main>
  )
}

function Section({ n, title, lead, children }: { n: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section className="border-t border-grid py-14">
      <div className="mb-8 grid gap-2 md:grid-cols-[4rem_1fr]">
        <span className="font-mono text-sm text-muted">{n}</span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-3xl text-ink-2">{lead}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
