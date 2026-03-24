//src/services/stock.service.js
import db from "../store/db.js"

export function obtenerProductos() {

    const rows = db.prepare("SELECT * FROM productos").all()

    return rows.map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        lotes: JSON.parse(p.lotes || "[]")
    }))

}


export function guardarProductos(productos) {

    const deleteAll = db.prepare("DELETE FROM productos")

    const insert = db.prepare(`
        INSERT OR REPLACE INTO productos (codigo, nombre, categoria, lotes)
        VALUES (?, ?, ?, ?)
    `)

    const transaction = db.transaction((productos) => {

        deleteAll.run() // 💥 BORRA TODO PRIMERO

        for (const p of productos) {
            insert.run(
                p.codigo,
                p.nombre,
                p.categoria,
                JSON.stringify(p.lotes || [])
            )
        }
    })

    transaction(productos)
}