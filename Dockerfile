# ==========================================
# Etapa 1 — Build del bundle con Vite
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependencias primero para aprovechar la cache de capas:
# solo se reinstalan si cambia package-lock.json.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite incrusta las variables VITE_* en el bundle EN TIEMPO DE BUILD, no de
# ejecucion. Por eso llegan como ARG y no como variables del contenedor final:
# pasarlas en `docker run` no tendria ningun efecto.
#
#   docker build --build-arg VITE_API_URL=https://api.midominio.com/api .
#
# Recuerda que todo esto queda visible en el JS publico: aqui solo van claves
# publicas (la public key de Mercado Pago, la config web de Firebase).
#
# NOTA: el linter de Docker avisa de "SecretsUsedInArgOrEnv" por los nombres
# terminados en _KEY. Es un falso positivo: la configuracion web de Firebase
# esta pensada para ser publica y de hecho se sirve dentro del bundle. Los
# secretos reales (access token de Mercado Pago, API key del servicio de IA)
# viven solo en el backend y nunca entran en esta imagen.
ARG VITE_API_URL=/api
ARG VITE_MP_PUBLIC_KEY=
ARG VITE_FIREBASE_API_KEY=
ARG VITE_FIREBASE_AUTH_DOMAIN=
ARG VITE_FIREBASE_PROJECT_ID=
ARG VITE_FIREBASE_STORAGE_BUCKET=
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=
ARG VITE_FIREBASE_APP_ID=
ARG VITE_FIREBASE_VAPID_KEY=

ENV VITE_API_URL=$VITE_API_URL \
    VITE_MP_PUBLIC_KEY=$VITE_MP_PUBLIC_KEY \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY

RUN npm run build

# El service worker de FCM no pasa por Vite (los SW no leen import.meta.env),
# asi que sus marcadores __VITE_*__ se sustituyen aqui sobre el build final.
RUN sed -i \
    -e "s|__VITE_FIREBASE_API_KEY__|${VITE_FIREBASE_API_KEY}|g" \
    -e "s|__VITE_FIREBASE_AUTH_DOMAIN__|${VITE_FIREBASE_AUTH_DOMAIN}|g" \
    -e "s|__VITE_FIREBASE_PROJECT_ID__|${VITE_FIREBASE_PROJECT_ID}|g" \
    -e "s|__VITE_FIREBASE_STORAGE_BUCKET__|${VITE_FIREBASE_STORAGE_BUCKET}|g" \
    -e "s|__VITE_FIREBASE_MESSAGING_SENDER_ID__|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" \
    -e "s|__VITE_FIREBASE_APP_ID__|${VITE_FIREBASE_APP_ID}|g" \
    dist/firebase-messaging-sw.js

# ==========================================
# Etapa 2 — Servir los estaticos con Nginx
# ==========================================
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx necesita escribir cache y PID; se le dan permisos al usuario sin
# privilegios que ya trae la imagen oficial.
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
