import { useState, useEffect } from 'react'
import { getAlertas } from '../api/alertas'

export function useAlertas() {
  const [alertasNoLeidas, setAlertasNoLeidas] = useState(0)

  useEffect(() => {
    getAlertas({ leida: false })
      .then(data => setAlertasNoLeidas(data.count ?? data.length ?? 0))
      .catch(() => {})
  }, [])

  return { alertasNoLeidas }
}
