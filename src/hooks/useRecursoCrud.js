import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { extraerLista } from '../api/crudFactory'
import { extraerCampos, mensajeError } from '../api/errores'

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
      setErrores(extraerCampos(err))
      toast.error(mensajeError(err, mensajes.errorGuardar ?? 'Error al guardar'))
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
    } catch (err) {
      toast.error(mensajeError(err, mensajes.errorEliminar ?? 'Error al eliminar'))
      return false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso, cargar, confirmar])

  return { items, loading, saving, errores, setErrores, cargar, guardar, eliminar }
}
