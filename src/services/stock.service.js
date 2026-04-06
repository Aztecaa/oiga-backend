//src/services/stock.services.js
import pool from "../db.js"

export async function obtenerProductos() {
    console.log("📦 GET productos")

    const productosRes = await pool.query("SELECT * FROM productos")
    const lotesRes = await pool.query("SELECT * FROM lotes")

    const resultado = productosRes.rows.map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        lotes: lotesRes.rows.filter(l => l.producto_codigo === p.codigo)
    }))

    console.log("📦 Productos encontrados:", resultado.length)

    return resultado
}

export async function actualizarLoteDB(codigo, data) {
    const {
        numeroOriginal,
        cantidad,
        fechaVencimiento
    } = data

    const fecha = fechaVencimiento || null;

    await pool.query(
        `
        UPDATE lotes
        SET 
            cantidad = COALESCE($1, cantidad),
            fecha_vencimiento = COALESCE($2, fecha_vencimiento)
        WHERE producto_codigo = $3 AND numero = $4
        `,
        [cantidad, fecha, codigo, numeroOriginal]
    )

    console.log("✅ Lote actualizado:", codigo, numeroOriginal)
}

export async function guardarProducto(data) {
    console.log("🟢 POST producto:", data)

    const {
        codigo,
        nombre,
        categoria,
        numeroLote,
        fechaVencimiento,
        cantidad
    } = data

    await pool.query(
        `
        INSERT INTO productos (codigo, nombre, categoria)
        VALUES ($1, $2, $3)
        ON CONFLICT (codigo) DO NOTHING
        `,
        [codigo, nombre, categoria]
    )

    const loteExistente = await pool.query(
        `
        SELECT * FROM lotes 
        WHERE producto_codigo=$1 AND numero=$2
        `,
        [codigo, numeroLote]
    )

    if (loteExistente.rows.length > 0) {
        console.log("🟡 Actualizando lote existente")

        await pool.query(
            `
            UPDATE lotes 
            SET cantidad = cantidad + $1 
            WHERE producto_codigo=$2 AND numero=$3
            `,
            [cantidad, codigo, numeroLote]
        )
    } else {
        console.log("🟢 Creando nuevo lote")

        await pool.query(
            `
            INSERT INTO lotes (producto_codigo, numero, fecha_vencimiento, cantidad)
            VALUES ($1, $2, $3, $4)
            `,
            [codigo, numeroLote, fechaVencimiento, cantidad]
        )
    }

    console.log("✅ Producto guardado:", codigo)
}

export async function eliminarProductoDB(codigo) {
    console.log("🔴 DELETE producto:", codigo)

    await pool.query("DELETE FROM lotes WHERE producto_codigo=$1", [codigo])
    await pool.query("DELETE FROM productos WHERE codigo=$1", [codigo])
}

export async function eliminarLoteDB(codigo, numero) {
    console.log("🔴 DELETE lote:", codigo, numero)

    await pool.query(
        "DELETE FROM lotes WHERE producto_codigo=$1 AND numero=$2",
        [codigo, numero]
    )
}

export async function actualizarProductoDB(codigo, data) {
    console.log("🟣 PUT producto:", codigo, data)

    const { nombre, categoria } = data

    await pool.query(
        `
        UPDATE productos 
        SET nombre = COALESCE($1, nombre),
            categoria = COALESCE($2, categoria)
        WHERE codigo=$3
        `,
        [nombre, categoria, codigo]
    )

    console.log("✅ Producto actualizado:", codigo)
}