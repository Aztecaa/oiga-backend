//backend-src/db.js
import dotenv from "dotenv"
dotenv.config()

import pkg from "pg"
const { Pool } = pkg

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export default pool