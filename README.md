# DB Compass

A visual guide to **OLTP vs OLAP**, and to when you'd reach for **SQLite, PostgreSQL, MySQL, TimescaleDB, ClickHouse, DuckDB, Cube** and **Kafka**. It explains them by how data moves, not by feature lists.

## What's on the page

1. **Two kinds of work.** OLTP and OLAP side by side: the typical query, how many rows and columns it touches, writes, latency, storage layout.
2. **Why the storage layout decides it.** One small table is laid out as disk pages twice, row by row and column by column. Switch between "fetch order #6" and "total revenue" and count the pages each layout reads.
3. **The map.** Workload (transactional → analytical) against scale (device → cluster), with each database as a region. Cube is drawn as a layer above the databases because it's a semantic layer, not a database. Hover a region to see when to use it and when to avoid it.
4. **Which one for my project?** Six questions give each tool a fit score and the reasons behind it, and move a "you" dot on the map.
5. **How they fit together.** An animated diagram of a typical setup: app → Postgres, phone → SQLite, CDC/events → ClickHouse → Cube → dashboards and apps. You can highlight just the OLTP or OLAP path, or switch on **Kafka** to see the streaming path.
6. **Cheat sheet.** Common scenarios against each tool, rated great / good / meh / —. Hover a row to see why.

The fit scores are hand-tuned weights for teaching, not benchmarks.

## Run it

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm test      # scoring heuristics (node:test, needs Node ≥ 22.18)
pnpm build
```

## Built with

React, Vite, Tailwind CSS v4 and hand-written SVG, with no chart library. The logos come from [Simple Icons](https://simpleicons.org).

The chart colours follow a palette that was checked for colour-blind readability. Only three colours stay distinguishable on the map, so blue, orange and green go to PostgreSQL, ClickHouse and SQLite. The other tools are grey and told apart by a texture or outline: MySQL has a plain outline, TimescaleDB a dotted fill, DuckDB a hatched fill, and Cube a dashed outline.

## Where things live

| File | What |
|---|---|
| `src/tools.ts` | Each tool's name, colour, description and when to use or avoid it |
| `src/recommend.ts` | The chooser's scoring heuristics and the "you" dot position |
| `src/sections/` | One component per section of the page |
| `src/ToolIcon.tsx` | Brand icons and colours |
