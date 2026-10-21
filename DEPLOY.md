# Despliegue provisorio: bienestar.consultoriadigital.io

Pasos para un servidor Ubuntu/Debian con acceso SSH y `sudo`. El servidor debe tener Node.js, npm, Git y Nginx. Esta web no necesita instalar dependencias del proyecto.

## 1. DNS

En la zona DNS de `consultoriadigital.io`, crear un registro **A** con nombre `bienestar`, valor `2.57.91.91` (la IP que aparece en la captura del panel) y TTL `300`. Confirmar que esa IP es la del servidor antes de guardarlo. Esperar a que `dig +short bienestar.consultoriadigital.io` devuelva esa dirección.

## 2. Código y PM2

```bash
sudo mkdir -p /srv/bienestar
sudo chown "$USER":"$USER" /srv/bienestar
git clone https://github.com/facndo12/BienEstar.git /srv/bienestar
cd /srv/bienestar
node --version
npm --version
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 status
curl -I http://127.0.0.1:3104/
pm2 startup
```

Ejecutar el comando `sudo ...` que imprime `pm2 startup`. Luego:

```bash
pm2 save
```

La aplicación escucha solo en `127.0.0.1:3104`; Nginx será el punto de acceso público. Si el puerto 3104 ya está ocupado, cambiar `PORT` en `ecosystem.config.cjs` y `proxy_pass` en la configuración de Nginx.

## 3. Nginx

Si Nginx no está instalado: `sudo apt update && sudo apt install -y nginx`.

```bash
sudo cp /srv/bienestar/deploy/nginx-bienestar.conf /etc/nginx/sites-available/bienestar
sudo ln -s /etc/nginx/sites-available/bienestar /etc/nginx/sites-enabled/bienestar
sudo nginx -t
sudo systemctl reload nginx
curl -I http://bienestar.consultoriadigital.io/
```

Si el enlace ya existe, no repetir `ln -s`. Los puertos 80 y 443 deben estar abiertos en el firewall del servidor y del proveedor.

## 4. HTTPS

Hacerlo cuando el registro A ya resuelva hacia el servidor y HTTP funcione. Seguir las [instrucciones actuales de Certbot para Nginx](https://certbot.eff.org/instructions?ws=nginx&os=snap). Con Certbot instalado:

```bash
sudo certbot --nginx -d bienestar.consultoriadigital.io
sudo certbot renew --dry-run
curl -I https://bienestar.consultoriadigital.io/
```

## Actualizaciones

```bash
cd /srv/bienestar
git pull --ff-only origin main
pm2 restart bienestar
pm2 status
```
