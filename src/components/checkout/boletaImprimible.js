import { formatSoles, formatFechaHoraCorta } from '../../utils/formatters'
import { etiquetarMetodo } from './metodosPago'
import { METODO_PAGO } from '../../utils/constants'

/**
 * Generacion del ticket imprimible (80 mm) en una ventana aparte.
 *
 * Vive fuera del componente porque es logica de presentacion en HTML plano,
 * sin React: mezclarla con el JSX del drawer hacia ese archivo el doble de
 * largo y muchisimo mas dificil de leer.
 */

const filaProducto = (item) => `
    <tr>
      <td style="padding:3px 0">${item.cantidad}x ${item.nombre}</td>
      <td style="text-align:right;padding:3px 0;white-space:nowrap">${formatSoles(parseFloat(item.precio) * item.cantidad)}</td>
    </tr>`

const filaVuelto = (metodo, vuelto) => {
  if (metodo !== METODO_PAGO.EFECTIVO || vuelto == null) return ''
  return `
    <tr><td colspan="2"><hr style="border:none;border-top:1px dashed #ccc;margin:6px 0"></td></tr>
    <tr>
      <td style="padding:2px 0">Vuelto</td>
      <td style="text-align:right;padding:2px 0;font-weight:bold">${formatSoles(vuelto)}</td>
    </tr>`
}

// Se parte el cierre de etiqueta para que la cadena no termine el <script>
// que la contiene si el bundle llegara a inlinearse dentro de un HTML.
const CIERRE_SCRIPT = '<' + '/script>'

const ESTILOS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #111;
      width: 80mm;
      margin: 0 auto;
      padding: 8mm 4mm;
    }
    .center { text-align: center; }
    .bold   { font-weight: bold; }
    .big    { font-size: 16px; }
    .small  { font-size: 10px; color: #555; }
    hr      { border: none; border-top: 1px dashed #aaa; margin: 6px 0; }
    table   { width: 100%; border-collapse: collapse; }
    .total-row td { font-weight: bold; font-size: 14px; padding-top: 6px; }
    .footer { margin-top: 10px; font-size: 10px; color: #777; text-align: center; }
    @media print {
      body { width: 80mm; }
      @page { size: 80mm auto; margin: 0; }
    }`

/** Construye el documento HTML completo del ticket. */
export function construirHtmlBoleta({ boleta, items, subtotalSinIgv, igvMonto, metodo, pagoData }) {
  const { texto: metodoTexto } = etiquetarMetodo(metodo)
  const fecha = formatFechaHoraCorta(new Date())

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Boleta ${boleta.numero}</title>
  <style>${ESTILOS}
  </style>
</head>
<body>
  <div class="center bold big" style="margin-bottom:4px">CAJA REGISTRADORA</div>
  <div class="center small">Boleta Electrónica de Venta</div>
  <hr>
  <div class="center bold" style="font-size:13px">${boleta.numero}</div>
  <div class="center small">${fecha}</div>
  <hr>
  <table>
    <tbody>${items.map(filaProducto).join('')}</tbody>
  </table>
  <hr>
  <table>
    <tbody>
      <tr>
        <td class="small" style="padding:2px 0">Subtotal s/IGV</td>
        <td class="small" style="text-align:right;padding:2px 0">${formatSoles(subtotalSinIgv)}</td>
      </tr>
      <tr>
        <td class="small" style="padding:2px 0">IGV (18%)</td>
        <td class="small" style="text-align:right;padding:2px 0">${formatSoles(igvMonto)}</td>
      </tr>
      <tr class="total-row">
        <td style="padding-top:6px">TOTAL</td>
        <td style="text-align:right;padding-top:6px">${formatSoles(boleta.total)}</td>
      </tr>
      <tr><td colspan="2"><hr></td></tr>
      <tr>
        <td class="small" style="padding:2px 0">Método de pago</td>
        <td class="small" style="text-align:right;padding:2px 0">${metodoTexto}</td>
      </tr>
      ${filaVuelto(metodo, pagoData?.vuelto)}
    </tbody>
  </table>
  <div class="footer">
    <hr>
    <p>Gracias por su compra</p>
    <p style="margin-top:3px">Este documento es válido como comprobante</p>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }${CIERRE_SCRIPT}
</body>
</html>`
}

/**
 * Abre el ticket en una ventana emergente lista para imprimir.
 * @returns {boolean} false si el navegador bloqueo la ventana.
 */
export function imprimirBoleta(datos) {
  const ventana = window.open(
    '', '_blank', 'width=340,height=600,toolbar=0,menubar=0,scrollbars=1',
  )
  if (!ventana) return false

  ventana.document.write(construirHtmlBoleta(datos))
  ventana.document.close()
  return true
}
