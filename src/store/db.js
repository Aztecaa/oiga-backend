//src/store/db.js
import Database from "better-sqlite3"

const db = new Database("./src/store/stock.db")

db.prepare(`
CREATE TABLE IF NOT EXISTS productos (
  codigo TEXT PRIMARY KEY,
  nombre TEXT,
  categoria TEXT,
  lotes TEXT
)
`).run()

export default db