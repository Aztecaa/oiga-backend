import express from "express"
import crypto from "crypto"

import { obtenerProductos, guardarProductos } from "../services/stock.service.js"

const router = express.Router()

// GET
router.get("/", (req, res) => {
    const productos = obtenerProductos()
    res.json(productos)
})

// POST
router.post("/", (req, res) => {
    const productos = obtenerProductos()

    const {
        nombre,
        codigo,
        numeroLote,
        fechaVencimiento,
        cantidad,
        categoria
    } = req.body

    if (!codigo || !nombre) {
        return res.status(400).json({ msg: "faltan datos" })
    }

    let producto = productos.find(p => p.codigo === codigo)

    if (!producto) {
        producto = {
            codigo,
            nombre,
            categoria,
            lotes: []
        }
        productos.push(producto)
    }

    const loteExistente = producto.lotes.find(
        l => l.numero === numeroLote
    )

    if (loteExistente) {
        loteExistente.cantidad += cantidad
    } else {
        producto.lotes.push({
            numero: numeroLote,
            fechaVencimiento,
            cantidad
        })
    }

    guardarProductos(productos)

    res.json(productos)
})

// DELETE
router.delete("/:codigo", (req, res) => {
    const productos = obtenerProductos()

    const nuevos = productos.filter(p => p.codigo !== req.params.codigo)

    guardarProductos(nuevos)

    res.json(nuevos)
})

router.delete("/:codigo/lote/:numero", (req, res) => {
    const productos = obtenerProductos()

    const producto = productos.find(p => p.codigo === req.params.codigo)

    if (!producto) {
        return res.status(404).json({ msg: "producto no encontrado" })
    }

    producto.lotes = producto.lotes.filter(
        l => l.numero !== req.params.numero
    )

    guardarProductos(productos)

    res.json(productos)
})

// PUT
router.put("/:codigo", (req, res) => {
    const productos = obtenerProductos()

    const producto = productos.find(p => p.codigo === req.params.codigo)

    if (!producto) {
        return res.status(404).json({ msg: "no encontrado" })
    }

    const { nombre, categoria } = req.body

    producto.nombre = nombre ?? producto.nombre
    producto.categoria = categoria ?? producto.categoria

    guardarProductos(productos)

    res.json(productos)
})

export default router