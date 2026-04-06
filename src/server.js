//backend-src/server.js
import { initDB } from "./init-db.js"
import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import productosRoutes from "./routes/productos.js"
import { obtenerProductos } from "./services/stock.service.js"
import authRoutes from "./routes/auth.routes.js"
import { Server } from "socket.io"

dotenv.config()

const app = express()
const server = http.createServer(app)

app.use(express.json())

const allowedOrigin =
process.env.NODE_ENV === "production"
? process.env.FRONTEND_PROD
: process.env.FRONTEND_DEV

app.use(
    cors({
        origin: allowedOrigin,
                credentials: true
            })
        )
        
        app.use(
            session({
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false
    })
)
console.log("DATABASE_URL:", process.env.DATABASE_URL)

app.use("/api/auth", authRoutes)
app.use("/api/productos", productosRoutes)

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true
    }
})

io.on("connection", async socket => {
    const productos = await obtenerProductos()
    socket.emit("stockActualizado", productos)
    
    socket.on("disconnect", () => { })
})

await initDB()


const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
    console.log(`🚀 Server escuchando en http://localhost:${PORT}`)
})