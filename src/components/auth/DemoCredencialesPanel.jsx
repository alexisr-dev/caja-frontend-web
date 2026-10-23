import { Copy, KeyRound, LayoutDashboard, ShieldCheck, Store } from 'lucide-react'
import { toast } from 'react-toastify'

import { env } from '../../config/env'

const CUENTAS = [
  {
    id: 'admin',
    titulo: 'Panel de administración',
    descripcion: 'Productos, usuarios, reportes, turnos y alertas',
    icono: LayoutDashboard,
    credenciales: env.demo.admin,
  },
  {
    id: 'vendedor',
    titulo: 'Panel de caja',
    descripcion: 'Venta con escáner, cobros y cierre de turno',
    icono: Store,
    credenciales: env.demo.vendedor,
  },
]

const PASOS_2FA = [
  <>Entra con la cuenta de <b>administración</b> de arriba.</>,
  <>Ve a <b>Usuarios → Nuevo usuario</b>.</>,
  <>Créala con <b>tu propio correo</b> y rol <b>Vendedor</b> o <b>Administrador</b>.</>,
  <>Cierra sesión e inicia con ella: te llegará un <b>código de 6 dígitos</b> a tu correo.</>,
]

export default function DemoCredencialesPanel({ onUsar }) {
  const copiar = async (texto, etiqueta) => {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success(`${etiqueta} copiado`)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <aside className="panel p-6 w-full lg:w-[26rem] bg-gray-50">
      <div className="flex items-start gap-3">
        <span className="bg-gold text-gray-900 rounded-xl w-10 h-10 flex items-center justify-center shrink-0">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Demo para reclutadores</h2>
          <p className="text-sm text-gray-500">
            Usa cualquiera de estas cuentas: entran directo, sin código de verificación.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {CUENTAS.map(({ id, titulo, descripcion, icono: Icono, credenciales }) => (
          <div key={id} className="bg-white border border-gray-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-gray-900">
              <Icono size={17} className="text-primary shrink-0" />
              <h3 className="text-sm font-extrabold">{titulo}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{descripcion}</p>

            <dl className="mt-3 space-y-1.5 text-xs">
              <Campo
                etiqueta="Email"
                valor={credenciales.email}
                onCopiar={() => copiar(credenciales.email, 'Email')}
              />
              <Campo
                etiqueta="Clave"
                valor={credenciales.password}
                onCopiar={() => copiar(credenciales.password, 'Contraseña')}
              />
            </dl>

            <button
              type="button"
              onClick={() => onUsar(credenciales.email, credenciales.password)}
              className="mt-3 w-full h-10 bg-sunk text-gray-900 rounded-[10px] text-sm font-bold hover:bg-primary hover:text-white transition-[background-color,color,transform] duration-150 active:scale-[0.98]"
            >
              Usar estas credenciales
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-warn-bg rounded-xl px-3.5 py-3">
        <div className="flex items-center gap-2 text-warn">
          <KeyRound size={16} className="shrink-0" />
          <h3 className="text-sm font-extrabold">¿Quieres probar el 2FA real?</h3>
        </div>
        <p className="text-xs text-[#5E3E00] mt-1.5">
          Solo estas dos cuentas omiten el código. Cualquier otro usuario sí lo pide, así que
          puedes crear el tuyo y ver el flujo completo:
        </p>
        <ol className="mt-2 space-y-1 text-xs text-[#5E3E00] list-decimal list-inside marker:font-extrabold">
          {PASOS_2FA.map((paso, i) => (
            <li key={i}>{paso}</li>
          ))}
        </ol>
      </div>
    </aside>
  )
}

function Campo({ etiqueta, valor, onCopiar }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-gray-500 w-11 shrink-0">{etiqueta}</dt>
      <dd className="font-bold text-gray-900 truncate flex-1 tabular-nums" title={valor}>
        {valor}
      </dd>
      <button
        type="button"
        onClick={onCopiar}
        title={`Copiar ${etiqueta.toLowerCase()}`}
        aria-label={`Copiar ${etiqueta.toLowerCase()}`}
        className="text-gray-400 hover:text-primary transition-colors shrink-0"
      >
        <Copy size={15} />
      </button>
    </div>
  )
}
