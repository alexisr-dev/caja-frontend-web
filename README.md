<div align="center">

# 🛒 caja-frontend-web

**Panel administrativo y caja registradora web para un supermercado inteligente**

Interfaz React que cobra ventas reconociendo productos **con la cámara**, sin código de barras:
apunta, el producto se agrega solo al carrito y se cobra en efectivo, tarjeta o Yape.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-Checkout_API-009EE3?logo=mercadopago&logoColor=white)](https://www.mercadopago.com.pe/developers)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/docs/cloud-messaging)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](#-despliegue-con-docker)
[![License](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](LICENSE)

</div>

---

## 📋 Tabla de contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Decisiones de diseño](#-decisiones-de-diseño)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Calidad de código](#-calidad-de-código)
- [Seguridad](#-seguridad)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## 📖 Descripción

`caja-frontend-web` es la aplicación web del sistema de caja inteligente. Reúne **dos interfaces
en una sola SPA**, separadas por rol:

| Rol | Ruta | Qué hace |
|-----|------|----------|
| **Vendedor** | `/caja` | Escanea productos con la cámara, gestiona el carrito, cobra y abre/cierra turno |
| **Administrador** | `/admin` | Productos, categorías, proveedores, descuentos, usuarios, boletas, turnos, reportes, alertas y entrenamiento del catálogo visual |

El rol *Cliente* no usa esta aplicación: dispone de una app móvil aparte.

La pieza diferencial es la **caja sin código de barras**. La cámara envía fotogramas al backend,
que delega el reconocimiento en un microservicio de visión por computador. Para evitar que un
fotograma borroso agregue un producto equivocado, el frontend aplica **votación por mayoría**:
solo confirma un producto cuando varias lecturas consecutivas coinciden, y entra en *cooldown*
tras cada alta para que el vendedor pueda retirar el artículo sin duplicarlo.

---

## ✨ Características

**Caja (vendedor)**
- 📷 Reconocimiento de productos en vivo con confirmación por consenso entre fotogramas
- 🛒 Carrito con animación de vuelo del producto y cálculo de IGV en tiempo real
- 💵 Cobro en **efectivo** (con sugerencias de billetes y vuelto en vivo)
- 💳 Cobro con **tarjeta** vía Mercado Pago Checkout API — tokenización en el navegador, sin datos PCI en el servidor
- 📱 Cobro con **Yape** mediante código de aprobación OTP
- 🧾 Boleta imprimible en formato ticket de 80 mm
- 🔐 Apertura y cierre de turno con cuadre automático de caja

**Administración**
- 📦 Catálogo completo: productos, variantes, fotos, historial de precios y ajustes de stock
- 🏷️ Categorías, proveedores y descuentos (porcentaje, monto fijo y N×M)
- 👥 Gestión de usuarios y roles
- 📊 Dashboard y reportes de ventas, top de productos y stock bajo
- 🔔 Alertas de inventario y notificaciones push (Firebase Cloud Messaging)
- 🧠 Registro visual: subida de fotos para entrenar el catálogo de reconocimiento

**Transversal**
- 🔑 Autenticación JWT con **2FA por email** y refresco de token transparente
- 🛡️ Rutas protegidas por rol

---

## 🏗 Arquitectura

Esta aplicación es el extremo visible de un sistema de tres piezas:

```
┌─────────────────────┐      HTTPS/JWT       ┌──────────────────┐     X-API-Key    ┌───────────────────┐
│  caja-frontend-web  │ ───────────────────► │   caja-backend   │ ───────────────► │  caja-ia-service  │
│   React + Vite      │ ◄─────────────────── │  Django REST     │ ◄─────────────── │  FastAPI + YOLO   │
│      (esta app)     │       JSON           │   PostgreSQL     │   SKU + bbox     │   CLIP + Chroma   │
└─────────────────────┘                      └──────────────────┘                  └───────────────────┘
```

El frontend **nunca habla directamente con el servicio de IA**: toda petición pasa por el backend,
que es quien autentica al usuario, guarda la trazabilidad de cada escaneo y custodia la API key
del microservicio.

**Flujo de un cobro**

```
Cámara ──► POST /api/escanear/ ──► producto reconocido ──► carrito
                                                             │
                                          POST /api/boletas/ │ (boleta PENDIENTE)
                                                             ▼
                            POST /api/pagos/{efectivo|mp-tarjeta|mp-yape}/
                                                             │
                                                             ▼
                                            boleta PAGADA + comprobante
```

La boleta se crea *antes* de elegir el medio de pago y se guarda en `sessionStorage`. Así, si el
navegador se recarga en mitad del cobro, se reutiliza la boleta existente en lugar de generar una
nueva y dejar la anterior colgada. Al cerrar el cobro sin pagar, se cancela en el backend.

---

## 🧰 Stack tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | React 18 |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Enrutado | React Router 6 |
| HTTP | Axios (con interceptores de JWT) |
| Estado | Context API + hooks propios |
| Formularios | React Hook Form |
| Gráficos | Recharts |
| Cámara | react-webcam |
| Pagos | Mercado Pago SDK React |
| Push | Firebase Cloud Messaging |
| Iconos | Lucide React |
| Calidad | ESLint 9 (flat config) |

---

## 📂 Estructura del proyecto

```
caja-frontend-web/
├── src/
│   ├── api/                  # Cliente HTTP y un módulo por recurso REST
│   │   ├── client.js         # Axios + JWT + refresco con cola de peticiones
│   │   └── crudFactory.js    # Factory de clientes CRUD (patrón Factory)
│   ├── components/
│   │   ├── camera/           # Captura y overlay del bounding box
│   │   ├── cart/             # Carrito y animaciones
│   │   ├── checkout/         # Cobro: métodos de pago, boleta, impresión
│   │   ├── common/           # Componentes reutilizables de UI
│   │   ├── descuentos/       # Formulario de descuentos
│   │   ├── layout/           # Layouts de Admin y Caja
│   │   ├── productos/        # Formularios, tarjetas y gráficos de producto
│   │   └── turnos/           # Apertura y cierre de caja
│   ├── config/env.js         # Único punto de lectura de variables de entorno
│   ├── context/              # Auth, Cart y Turno
│   ├── hooks/                # useEscanerContinuo, useRecursoCrud, useFCMToken…
│   ├── pages/
│   │   ├── admin/            # Pantallas del panel administrativo
│   │   └── vendedor/         # Pantallas de la caja
│   ├── services/             # Estado de navegador (tokens, boleta pendiente)
│   └── utils/                # Cálculos, formateo y constantes de dominio
├── public/                   # Estáticos y service worker de FCM
├── Dockerfile                # Build multi-etapa → Nginx
├── nginx.conf                # Configuración SPA + cabeceras de seguridad
└── docker-compose.yml
```

---

## ✅ Requisitos

- **Node.js 20+** y npm 10+
- Una instancia de [`caja-backend`](https://github.com/alexisr-dev/caja-backend) accesible
- *(Opcional)* [`caja-ia-service`](https://github.com/alexisr-dev/caja-ia-service) para el escáner
- *(Opcional)* Cuenta de Mercado Pago y proyecto de Firebase
- *(Opcional)* Docker 24+ para el despliegue en contenedor

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/alexisr-dev/caja-frontend-web.git
cd caja-frontend-web

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de entorno a partir de la plantilla
cp .env.example .env.development
#    → editar .env.development con los valores reales

# 4. Arrancar en modo desarrollo
npm run dev
```

La aplicación queda disponible en **http://localhost:5173**.

---

## ⚙️ Configuración

Todas las variables se declaran en `.env.example`. Vite solo expone al navegador las que llevan
el prefijo `VITE_`.

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `VITE_API_URL` | URL base del backend. En desarrollo, `/api` usa el proxy de Vite | `/api` |
| `VITE_MP_PUBLIC_KEY` | Clave **pública** de Mercado Pago. El prefijo `TEST-` activa el modo sandbox | — |
| `VITE_FIREBASE_API_KEY` | Configuración web de Firebase | — |
| `VITE_FIREBASE_AUTH_DOMAIN` | Configuración web de Firebase | — |
| `VITE_FIREBASE_PROJECT_ID` | Configuración web de Firebase | — |
| `VITE_FIREBASE_STORAGE_BUCKET` | Configuración web de Firebase | — |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Configuración web de Firebase | — |
| `VITE_FIREBASE_APP_ID` | Configuración web de Firebase | — |
| `VITE_FIREBASE_VAPID_KEY` | Clave VAPID para push web | — |

> ⚠️ **Todo lo que empieza por `VITE_` viaja en el JavaScript público.** Solo deben ponerse
> claves pensadas para ser públicas. El *access token* de Mercado Pago y la clave del servicio
> de IA viven exclusivamente en el backend.

Si la configuración de Firebase se deja vacía, la aplicación arranca con normalidad y
simplemente no habilita las notificaciones push.

**Proxy de desarrollo.** `vite.config.js` redirige `/api` y `/media` a `http://localhost:8000`,
de modo que en local no hace falta configurar CORS.

---

## ▶️ Ejecución

```bash
npm run dev        # Servidor de desarrollo con HMR (puerto 5173)
npm run build      # Bundle de producción en dist/
npm run preview    # Sirve el bundle ya construido
npm run lint       # Analiza el código con ESLint
npm run lint:fix   # Corrige automáticamente lo que se pueda
```

---

## 🧩 Decisiones de diseño

Algunas elecciones que explican cómo está organizado el código:

**Registro de medios de pago (patrón *Strategy*).** Cada forma de cobro se declara en
`components/checkout/metodosPago.js` con su presentación, su regla de disponibilidad y el
componente que la resuelve. El drawer de cobro no conoce ningún método concreto, así que
incorporar uno nuevo consiste en añadir un objeto a esa lista.

**Factory de clientes REST.** Categorías, proveedores, descuentos y usuarios comparten el mismo
contrato CRUD; `api/crudFactory.js` genera sus clientes en vez de repetir cinco funciones por
recurso.

**Cálculo del IGV en un único lugar.** Los precios ya incluyen impuesto, de modo que el IGV se
*extrae* del total en lugar de sumarse encima. Esa fórmula vive solo en `utils/calculos.js`.

**Refresco de JWT con cola.** Si varias peticiones reciben un 401 a la vez, únicamente la primera
solicita un token nuevo; las demás esperan en cola y se reintentan cuando ese refresco termina.

**Separación de capas.** La carpeta `api/` se ocupa exclusivamente del transporte HTTP;
el estado del navegador (tokens, boleta en curso) vive en `services/`.

---

## 🐳 Despliegue con Docker

La imagen usa un build en dos etapas: Node compila el bundle y **Nginx** sirve los estáticos
como usuario sin privilegios.

```bash
# Build y arranque con docker compose (lee las variables del .env local)
docker compose up --build

# O construyendo la imagen a mano
docker build \
  --build-arg VITE_API_URL=https://api.tu-dominio.com/api \
  --build-arg VITE_MP_PUBLIC_KEY=APP_USR-xxxxxxxx \
  -t caja-frontend-web .

docker run -p 5173:8080 caja-frontend-web
```

Disponible en **http://localhost:5173**.

> 💡 **Por qué `--build-arg` y no variables de entorno del contenedor:** Vite incrusta los valores
> `VITE_*` en el JavaScript durante la compilación. Pasarlos en `docker run` no tendría ningún
> efecto, porque para entonces el bundle ya está generado. Cambiar de entorno implica reconstruir
> la imagen.

`nginx.conf` incluye *fallback* de SPA (para que React Router resuelva las rutas), compresión
gzip, caché inmutable para los assets con hash y caché deshabilitada para el service worker.

---

## 🧪 Calidad de código

```bash
npm run lint
```

ESLint 9 con *flat config*, reglas recomendadas de React y `react-hooks`. El build de producción
aplica **code-splitting** por vendors, de forma que al publicar un cambio de la aplicación el
navegador no vuelve a descargar React, Recharts ni Firebase:

```
dist/assets/index-*.js            270 kB   (código de la app)
dist/assets/vendor-react-*.js     164 kB
dist/assets/vendor-charts-*.js    376 kB
dist/assets/vendor-firebase-*.js   88 kB
```

---

## 🔒 Seguridad

- **Sin secretos en el repositorio.** Los archivos `.env*` están excluidos por `.gitignore`; solo
  se versiona `.env.example` con marcadores de posición.
- **Datos de tarjeta.** El número de tarjeta y el CVV nunca llegan a los servidores propios: el
  SDK de Mercado Pago los tokeniza en el navegador y al backend solo viaja el token.
- **JWT.** El *access token* se renueva de forma transparente; si el *refresh* deja de ser válido,
  la sesión se limpia y se redirige al login.
- **Autorización por rol** en cada ruta protegida, respaldada por los permisos del backend.
- **Cabeceras de seguridad** en Nginx: `X-Content-Type-Options`, `X-Frame-Options` y
  `Referrer-Policy`.

> La validación del lado del cliente es una ayuda a la usabilidad, no una barrera de seguridad:
> el backend valida y autoriza toda operación de forma independiente.

---

## 🗺 Roadmap

- [ ] Tests de componentes con Vitest y Testing Library
- [ ] Migrar la carga de datos a React Query (caché y reintentos)
- [ ] Modo offline en caja con cola de sincronización
- [ ] Lectura de código de barras como alternativa al reconocimiento visual
- [ ] Internacionalización (i18n)

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Puedes usar, modificar y redistribuir el código, pero **cualquier obra derivada —incluso si se
ofrece como servicio a través de una red— debe publicarse también bajo AGPL-3.0 y poner su código
fuente a disposición**. Se mantiene la misma licencia que el resto de componentes del sistema.

Consulta el archivo [LICENSE](LICENSE) para el texto completo.

---

## 👤 Autor

**Alexis Nehemías Ramírez Merino**

[![GitHub](https://img.shields.io/badge/GitHub-alexisr--dev-181717?style=flat&logo=github)](https://github.com/alexisr-dev)

---

## ⭐ Agradecimientos

- Al ecosistema **React** y **Vite** por su velocidad de desarrollo.
- A **Tailwind CSS** por hacer sostenible el diseño de dos interfaces distintas.
- A **Mercado Pago** y **Firebase** por sus SDKs y entornos de prueba.

<div align="center">

Si este proyecto te resultó útil, ¡considera dejar una ⭐!

</div>
