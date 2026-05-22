# Resumen de Servicio DIPRESEC

Sistema piloto con:

- GitHub Pages: interfaz web.
- Google Apps Script: backend/API.
- Google Sheets: base de datos.
- WhatsApp: link con texto precargado.
- Outlook: abre correo institucional con asunto y cuerpo precargado.

## 1. Crear Google Sheet

1. Crear una planilla llamada `Resumen Servicio DIPRESEC`.
2. Ir a Extensiones → Apps Script.
3. Pegar el contenido de `Code.gs`.
4. Cambiar `APP_TOKEN = 'CAMBIA_ESTE_TOKEN'` por una clave propia.
5. Guardar.
6. Ejecutar manualmente la función `setup` una vez.
7. Autorizar permisos.

## 2. Desplegar Apps Script como Web App

1. En Apps Script, presionar Implementar → Nueva implementación.
2. Tipo: Aplicación web.
3. Ejecutar como: Yo.
4. Quién tiene acceso: Cualquier usuario.
5. Implementar.
6. Copiar la URL terminada en `/exec`.

## 3. Publicar en GitHub Pages

1. Crear un repositorio, por ejemplo `resumen-servicio-dipresec`.
2. Subir `index.html`, `styles.css` y `script.js`.
3. Activar GitHub Pages en Settings → Pages.
4. Abrir el sitio publicado.
5. En la sección Configuración, pegar:
   - URL Web App de Apps Script.
   - Token configurado en `Code.gs`.
6. Guardar configuración.

## 4. Uso diario

1. Seleccionar fecha, turno y encargado/a.
2. Agregar ítems del resumen.
3. Cargar registros para verificar.
4. Generar resumen.
5. Copiar texto, abrir WhatsApp o abrir Outlook.

## Nota de seguridad

Esta versión usa un token simple para evitar escrituras accidentales. No se recomienda guardar datos personales sensibles. Para producción se debería evaluar autenticación institucional.
