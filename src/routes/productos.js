//src/routes/productos.js
import express from "express"
import {
    obtenerProductos,
    guardarProducto,
    eliminarProductoDB,
    eliminarLoteDB,
    actualizarProductoDB,
    actualizarLoteDB
} from "../services/stock.service.js"

const router = express.Router()

router.get("/", async (req, res) => {
    console.log("➡️ GET /productos")
    const productos = await obtenerProductos()
    res.json(productos)
})

router.post("/", async (req, res) => {
    console.log("➡️ POST /productos")

    await guardarProducto(req.body)

    const productos = await obtenerProductos()
    res.json(productos)
})

router.put("/:codigo/lote", async (req, res) => {
    console.log("➡️ PUT lote:", req.body)

    await actualizarLoteDB(req.params.codigo, req.body)

    const productos = await obtenerProductos()
    res.json(productos)
})

router.delete("/:codigo", async (req, res) => {
    console.log("➡️ DELETE producto:", req.params.codigo)

    await eliminarProductoDB(req.params.codigo)

    const productos = await obtenerProductos()
    res.json(productos)
})

router.delete("/:codigo/lote/:numero", async (req, res) => {
    console.log("➡️ DELETE lote:", req.params)

    await eliminarLoteDB(req.params.codigo, req.params.numero)

    const productos = await obtenerProductos()
    res.json(productos)
})

router.put("/:codigo", async (req, res) => {
    console.log("➡️ PUT producto:", req.params.codigo)

    await actualizarProductoDB(req.params.codigo, req.body)

    const productos = await obtenerProductos()
    res.json(productos)
})

export default router