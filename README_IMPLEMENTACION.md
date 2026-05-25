# Resumen de Servicio DIPRESEC - versión sin token

Esta versión elimina el campo Token para que el sistema sea más rápido e intuitivo para los encargados de servicio.

## Componentes

- `index.html`: interfaz web para GitHub Pages.
- `styles.css`: estilos visuales.
- `script.js`: lógica del navegador. Incluye la URL del Apps Script en la constante `DEFAULT_API_URL`.
- `Code.gs`: backend en Google Apps Script.

## Instrucciones rápidas

1. En Google Sheets, abre Extensiones > Apps Script.
2. Reemplaza todo el contenido por el nuevo `Code.gs`.
3. Ejecuta `setup` solo si necesitas crear o reiniciar la hoja `Registros`.
4. Implementa nuevamente como Aplicación web.
   - Ejecutar como: Yo.
   - Quién tiene acceso: Cualquier usuario.
5. En GitHub Pages reemplaza:
   - `index.html`
   - `styles.css`
   - `script.js`
6. Abre la página y prueba guardar un servicio.

## Seguridad

Esta versión no usa token. Es más simple para el usuario, pero cualquier persona que conozca la URL del Apps Script podría intentar enviar datos a la hoja. Para piloto interno está bien, pero no debe usarse para datos sensibles.

## Formato del resumen

El resumen se genera con estructura similar al ejemplo de Jacob:

- Saludo inicial.
- Introducción formal.
- Servicio en conjunto a Carabineros.
- Servicio "Plan Colegio".
- Patrullajes solicitados.
- Vigilancias especiales.
- Servicios extraordinarios.
- Móviles operativos para apoyo del turno.
- Novedades.
- Cierre con el nombre del encargado.
