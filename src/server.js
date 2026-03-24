//src/server.js
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import crypto from "crypto"
import productosRoutes from "./routes/productos.js"
import { obtenerProductos } from "./services/stock.service.js"
import authRoutes from "./routes/auth.routes.js"
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());

app.use("/api/auth", authRoutes)

const allowedOrigin =
    process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_PROD
        : process.env.FRONTEND_DEV;

app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/api/productos", productosRoutes)

// =======================
// SOCKET.IO (ACÁ SE CREA)
// =======================
const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true,
    },
});
// =======================
// SOCKET EVENTS
// =======================
io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    // Mandar stock inicial
    socket.emit("stockActualizado", obtenerProductos())

    socket.on("agregarProducto", (data) => {
        const {
            codigo,
            nombre,
            proveedor,
            categoria,
            precioCosto,
            fechaVencimiento,
            cantidad
        } = data;

        if (!codigo || !nombre || !precioCosto || cantidad <= 0) return;

        const precioVenta = Math.round(precioCosto * 1.7);

        let producto = productos.find(p => p.codigo === codigo);

        if (!producto) {
            producto = {
                codigo,
                nombre,
                proveedor,
                categoria,
                precioCosto,
                precioVenta,
                lotes: []
            };
            productos.push(producto);
        } else {
            // si cambia el costo, actualizamos
            producto.precioCosto = precioCosto;
            producto.precioVenta = precioVenta;
        }

        const loteExistente = producto.lotes.find(
            l => l.fechaVencimiento === fechaVencimiento
        );

        if (loteExistente) {
            loteExistente.cantidad += cantidad;
        } else {
            producto.lotes.push({
                fechaVencimiento,
                cantidad
            });
        }

        producto.lotes.sort(
            (a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
        );

        io.emit("stockActualizado", productos);
    });

    socket.on("eliminarProducto", (codigo) => {
        const index = productos.findIndex(p => p.codigo === codigo);
        if (index !== -1) productos.splice(index, 1);

        io.emit("stockActualizado", productos);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado:", socket.id);
    });
});

// =======================
// LISTEN
// =======================
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`🚀 Server escuchando en http://localhost:${PORT}`);
});
