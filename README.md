# BienEstar · landing page

Sitio estático, mobile first, para BienEstar Residencia de larga estadía para adultos mayores (Corrientes Capital).

## Vista local

Desde la raíz del proyecto:

```powershell
pnpm dev
```

Abrir `http://localhost:5173/`. No hace falta instalar dependencias.

## Contenido

- `index.html`: estructura, textos, metadatos y enlaces de contacto.
- `styles.css`: diseño adaptable y efectos de vidrio y hover.
- `script.js`: menú móvil, apariciones al desplazarse y efecto líquido del cursor.
- `dev-server.js`: servidor HTTP para `pnpm dev` y PM2; solo expone archivos de la web.
- `public/images/`: imágenes de marca proporcionadas por el cliente.

## Publicación provisoria

La configuración de PM2, Nginx y los pasos para el subdominio provisorio están en [DEPLOY.md](DEPLOY.md).

Antes de publicar, confirmar la dirección exacta en Maps y recibir los textos de política de privacidad, términos y aviso legal. El brief no incluye esos documentos.
