//backend-src/init-db.js
import pool from "./db.js"

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      codigo TEXT UNIQUE,
      nombre TEXT,
      categoria TEXT
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lotes (
      id SERIAL PRIMARY KEY,
      producto_codigo TEXT,
      numero TEXT,
      fecha_vencimiento DATE,
      cantidad INTEGER
    )
  `)
}