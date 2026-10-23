// Ilustración decorativa del login: un producto reconocido por la cámara.
// Es solo imagen (sin texto): barre una vez, confirma y se queda quieta.
const CONTORNO_BOTELLA =
  'M-8 11 H8 V28 C8 40 32 48 32 72 C32 92 24 102 24 118 C24 134 34 140 34 150 ' +
  'C34 157 28 160 20 160 H-20 C-28 160 -34 157 -34 150 C-34 140 -24 134 -24 118 ' +
  'C-24 102 -32 92 -32 72 C-32 48 -8 40 -8 28 Z'

const CAJAS_ESTANTE = [
  // estante alto
  { x: 22, y: 52, w: 38, h: 44, c: '#E3B341' },
  { x: 66, y: 62, w: 28, h: 34, c: '#5B8FA3' },
  { x: 296, y: 52, w: 40, h: 44, c: '#D9482B' },
  { x: 342, y: 60, w: 32, h: 36, c: '#4F8A5E' },
  // estante bajo
  { x: 18, y: 128, w: 48, h: 42, c: '#F7EFD9' },
  { x: 72, y: 132, w: 30, h: 38, c: '#C9553A' },
  { x: 290, y: 126, w: 36, h: 44, c: '#9C7A2E' },
  { x: 332, y: 132, w: 46, h: 38, c: '#5B8FA3' },
]

const BBOX = { x: 136, y: 20, w: 128, h: 232 }

export default function ScanIllustration() {
  const { x, y, w, h } = BBOX
  const x2 = x + w
  const y2 = y + h
  const L = 26

  return (
    <div
      className="relative mt-auto w-full aspect-[4/3] rounded-2xl overflow-hidden bg-navy-700 ring-1 ring-white/10"
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="scan-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <clipPath id="scan-botella">
            <path d={CONTORNO_BOTELLA} />
          </clipPath>
        </defs>

        {/* Fondo y estantes (fuera de foco) */}
        <rect width="400" height="300" fill="#16405F" />
        <rect x="0" y="96" width="400" height="6" fill="#0E2B44" opacity=".7" />
        <rect x="0" y="170" width="400" height="6" fill="#0E2B44" opacity=".7" />
        <g filter="url(#scan-blur)" opacity=".6">
          {CAJAS_ESTANTE.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="5" fill={b.c} />
              <rect x={b.x} y={b.y + b.h * 0.38} width={b.w} height={b.h * 0.22} fill="#ffffff" opacity=".35" />
            </g>
          ))}
        </g>

        {/* Mostrador */}
        <rect x="0" y="232" width="400" height="68" fill="#0E2B44" />
        <rect x="0" y="232" width="400" height="2" fill="#2A6A94" opacity=".8" />
        <rect x="40" y="246" width="320" height="2" fill="#2A6A94" opacity=".25" />

        {/* Sombra y botella */}
        <ellipse cx="200" cy="238" rx="54" ry="8" fill="#000000" opacity=".35" />
        <g transform="translate(200 36) scale(1.25)">
          <rect x="-9" y="0" width="18" height="12" rx="2.5" fill="#D9482B" />
          <path d="M-4 3 V9 M0 3 V9 M4 3 V9" stroke="#8E2A14" strokeWidth="1.2" strokeLinecap="round" />

          <path d={CONTORNO_BOTELLA} fill="#3B2418" />
          <g clipPath="url(#scan-botella)">
            <rect x="-40" y="26" width="26" height="140" fill="#5A3622" opacity=".7" />
            <rect x="-40" y="68" width="80" height="48" fill="#F7EFD9" />
            <rect x="-40" y="82" width="80" height="20" fill="#D9482B" />
            <path d="M-40 92 C-28 85 -16 99 -4 92 S20 85 40 92" stroke="#F7EFD9" strokeWidth="2.4" fill="none" />
          </g>

          <path d="M-20 58 C-25 80 -19 98 -19 120" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".35" />
          <path d="M-3 36 C-3 41 0 44 5 47" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".28" />
          <g fill="#ffffff" opacity=".4">
            <circle cx="-16" cy="132" r="1.5" />
            <circle cx="-8" cy="142" r="1.2" />
            <circle cx="14" cy="136" r="1.4" />
            <circle cx="20" cy="146" r="1.1" />
            <circle cx="10" cy="56" r="1.2" />
          </g>
        </g>

        {/* Atenuar todo lo que queda fuera del recuadro */}
        <path
          d={`M0 0H400V300H0Z M${x} ${y}H${x2}V${y2}H${x}Z`}
          fill="#071A2B"
          opacity=".4"
          fillRule="evenodd"
        />

        {/* Recuadro de reconocimiento */}
        <rect x={x} y={y} width={w} height={h} fill="none" stroke="#F5B31B" strokeOpacity=".35" />
        <g fill="none" stroke="#F5B31B" strokeWidth="4" strokeLinecap="square">
          <path d={`M${x} ${y + L}V${y}H${x + L}`} />
          <path d={`M${x2 - L} ${y}H${x2}V${y + L}`} />
          <path d={`M${x} ${y2 - L}V${y2}H${x + L}`} />
          <path d={`M${x2 - L} ${y2}H${x2}V${y2 - L}`} />
        </g>
        <g stroke="#F5B31B" strokeWidth="2" strokeOpacity=".6" strokeLinecap="round">
          <path d={`M${x} ${y + h / 2 - 6}V${y + h / 2 + 6}`} />
          <path d={`M${x2} ${y + h / 2 - 6}V${y + h / 2 + 6}`} />
        </g>

        {/* Barrido único del escáner */}
        <g className="animate-scan-sweep">
          <rect x={x + 2} y={y - 18} width={w - 4} height="18" fill="#F5B31B" opacity=".16" />
          <rect x={x + 2} y={y} width={w - 4} height="3" rx="1.5" fill="#F5B31B" />
        </g>

        {/* Confirmación: aparece cuando termina el barrido */}
        <g className="animate-chip-in" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <rect x="120" y="4" width="160" height="30" rx="9" fill="#46D27B" />
          <path d="M134 19 l5 5 l10 -11" fill="none" stroke="#16202B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="160" y="15" width="64" height="7" rx="3.5" fill="#16202B" opacity=".85" />
          <rect x="232" y="15" width="34" height="7" rx="3.5" fill="#16202B" opacity=".5" />
        </g>

        {/* Indicador de cámara activa */}
        <g>
          <rect x="14" y="14" width="64" height="22" rx="8" fill="#0E2B44" opacity=".85" />
          <circle cx="29" cy="25" r="4" fill="#46D27B" />
          <rect x="40" y="22" width="26" height="6" rx="3" fill="#ffffff" opacity=".55" />
        </g>
      </svg>
    </div>
  )
}
