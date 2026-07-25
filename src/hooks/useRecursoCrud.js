import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { extraerLista } from '../api/crudFactory'

/**
 * Ciclo de vida de una pantalla de administracion sobre un recurso REST.
 *
 * Las paginas de categorias, proveedores, descuentos y usuarios repetian el
 * mismo bloque: estado `items/loading/saving`, un `cargar()` que normaliza la
 * paginacion, y handlers de guardar/eliminar con toast y recarga. Todo eso
 * vive ahora aqui; la pantalla solo aporta el cliente del recurso y los textos.
 *
 * @param {object}   recurso        Cliente creado con `crearRecursoCrud`.
 * @param {object}   [opciones]
 * @param {object}   [opciones.params]    Query params de la carga inicial.
 * @param {object}   [opciones.mensajes]  Textos de exito/error por operacion.
 * @param {Function} [opciones.confirmar] Confirmacion previa al borrado.
 */
export function useRecursoCrud(recurso, opciones = {}) {
  const {
    params,
    mensajes = {},
    confirmar = () => true,
  } = opciones

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errores, setErrores] = useState({})

  // `params` suele ser un literal nuevo en cada render: se serializa para que
  // el efecto dependa de su contenido y no de su identidad.
  const paramsKey = JSON.stringify(params ?? null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await recurso.list(params)
      setItems(extraerLista(data))
    } catch {
      setItems([])
      toast.error(mensajes.errorCargar ?? 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso, paramsKey])

  useEffect(() => { cargar() }, [cargar])

  /** Crea si no hay `id`, actualiza si lo hay. Devuelve true si tuvo exito. */
  const guardar = useCallback(async (data, id = null) => {
    setSaving(true)
    setErrores({})
    try {
      if (id != null) {
        await recurso.update(id, data)
        toast.success(mensajes.actualizado ?? 'Actualizado correctamente')
      } else {
        await recurso.create(data)
        toast.success(mensajes.creado ?? 'Creado correctamente')
      }
      await cargar()
      return true
    } catch (err) {
      const detalle = err.response?.data
      if (detalle && typeof detalle === 'object') setErrores(detalle)
      toast.error(mensajes.errorGuardar ?? 'Error al guardar')
      return false
    } finally {
      setSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso, cargar])

  const eliminar = useCallback(async (id) => {
    if (!confirmar(id)) return false
    try {
      await recurso.remove(id)
      toast.success(mensajes.eliminado ?? 'Eliminado correctamente')
      await cargar()
      return true
    } catch {
      toast.error(mensajes.errorEliminar ?? 'Error al eliminar')
      return false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso, cargar, confirmar])

  return { items, loading, saving, errores, setErrores, cargar, guardar, eliminar }
}
