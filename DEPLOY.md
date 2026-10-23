# BienEstar en el VPS srv1224751

Esta guía corresponde al VPS de Hostinger cuya IPv4 es `72.60.15.125`. Sus webs existentes usan PM2 y Docker; Traefik (`n8n-traefik-1`) recibe HTTPS en el puerto 443. No instalar Nginx ni Certbot en este servidor para esta web.

## Datos comprobados

- DNS A: `bienestar.consultoriadigital.io` → `72.60.15.125`.
- Puerto `3104`: libre en el diagnóstico del 23/10/2026. Volver a verificarlo justo antes de iniciar.
- Red de Traefik: `n8n_default`; puerta de enlace del host `172.18.0.1`.
- Proveedor de archivos Traefik: `/docker/n8n/dynamic`, montado en `/etc/traefik/dynamic`, con observación de cambios activa.
- Resolver TLS existente: `mytlschallenge`.

## 1. Comprobar antes de instalar

Ejecutar como `root` en el VPS:

```bash
ss -H -ltnp '( sport = :3104 )'
docker ps -aq | xargs -r docker inspect --format '{{.Name}} {{json .HostConfig.PortBindings}}' | grep -F '"HostPort":"3104"' || true
find /docker/n8n/dynamic -maxdepth 1 -type f -printf '%f\n'
grep -R -nE 'bienestar\.consultoriadigital\.io|bienestar-landing|172\.18\.0\.1:3104' /docker/n8n/dynamic || true
ip -br addr | grep -F '172.18.0.1'
```

Si aparece un ocupante del puerto, un router BienEstar existente o falta `172.18.0.1`, detenerse y revisar antes de continuar.

## 2. Instalar y probar la web sin tocar Traefik

Si `/var/www/bienestar` todavía no existe:

```bash
cd /var/www
git clone https://github.com/facndo12/BienEstar.git bienestar
cd /var/www/bienestar
node --check dev-server.js
pm2 start ecosystem.config.cjs
pm2 status bienestar
curl -I --max-time 5 http://172.18.0.1:3104/
```

El `curl` debe responder `HTTP/1.1 200 OK`. El servidor escucha solo en la puerta de enlace interna de Docker, no en la IP pública.

## 3. Agregar una ruta aislada a Traefik

Primero comprobar que el archivo de destino no exista:

```bash
ls -l /docker/n8n/dynamic/bienestar-landing.yml
```

Si `ls` indica que **no existe** y las verificaciones anteriores fueron correctas, agregar el archivo nuevo:

```bash
install -m 0644 /var/www/bienestar/deploy/traefik-bienestar.yml /docker/n8n/dynamic/bienestar-landing.yml
```

Traefik observa ese directorio y carga el nuevo router sin reiniciar el contenedor ni editar rutas existentes. Comprobar la respuesta:

```bash
curl -I --max-time 15 https://bienestar.consultoriadigital.io/
docker logs --since 5m n8n-traefik-1 2>&1 | grep -iE 'bienestar|error|acme' | tail -n 30
```

El certificado se obtiene mediante el resolver TLS de Traefik ya configurado. No usar Certbot para este sitio.

## 4. Persistencia y futuras actualizaciones

Después de verificar HTTPS, respaldar el estado previo de PM2 antes de guardar la lista actual:

```bash
if [ -f /root/.pm2/dump.pm2 ]; then cp -a /root/.pm2/dump.pm2 "/root/.pm2/dump.pm2.before-bienestar-$(date +%Y%m%d-%H%M%S)"; fi
pm2 save
```

Para actualizar solo esta web:

```bash
cd /var/www/bienestar
git pull --ff-only origin main
pm2 restart bienestar
curl -I --max-time 5 http://172.18.0.1:3104/
```

No usar `pm2 restart all` ni reiniciar Traefik para publicar BienEstar.
