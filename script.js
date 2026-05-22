const $ = (id) => document.getElementById(id);

const TIPOS = [
  'Distribución de cuadrante',
  'Plan Colegio',
  'Servicio con Carabineros',
  'Patrullaje preventivo solicitado',
  'Vigilancia especial',
  'Punto fijo / breve punto fijo',
  'Fiscalización',
  'Recuperación de espacio público',
  'Servicio extraordinario',
  'Novedad de personal',
  'Observación general'
];

const CUADRANTES = [
  '215', '215-A', '215-B', '215-C',
  '216', '217', '218', '219', '220', '221', '222', '223',
  'Todos', 'No aplica'
];

const MODALIDADES = [
  'No aplica',
  'Patrullaje preventivo',
  'Patrullaje sin entrevista',
  'Patrullaje con entrevista',
  'Punto fijo',
  'Breve punto fijo',
  'Medidas cautelares',
  'Patrulla mixta',
  'Plan Colegio',
  'Fiscalización',
  'Recuperación de espacio público',
  'Otro'
];

const COMISARIAS = [
  'No aplica',
  '25° Comisaría',
  '29° Comisaría',
  '52° Comisaría',
  'Subcomisaría Maipú Oriente'
];

const NOVEDADES = [
  'No aplica',
  'Licencia médica',
  'Permiso',
  'Sin móvil',
  'Sin portátil',
  'Sin chaleco',
  'Cambio de móvil',
  'Otro'
];

function fillSelect(id, values) {
  const el = $(id);
  el.innerHTML = values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
}

function init() {
  fillSelect('tipo_registro', TIPOS);
  fillSelect('cuadrante', CUADRANTES);
  fillSelect('modalidad', MODALIDADES);
  fillSelect('comisaria', COMISARIAS);
  fillSelect('tipo_novedad', NOVEDADES);

  const today = new Date().toISOString().slice(0, 10);
  $('fecha').value = localStorage.getItem('rs_fecha') || today;
  $('turno').value = localStorage.getItem('rs_turno') || '1° turno';
  $('encargado').value = localStorage.getItem('rs_encargado') || '';
  $('apiUrl').value = localStorage.getItem('rs_apiUrl') || '';
  $('apiToken').value = localStorage.getItem('rs_apiToken') || '';

  $('btnSaveConfig').addEventListener('click', saveConfig);
  $('btnGuardar').addEventListener('click', guardarRegistro);
  $('btnCargar').addEventListener('click', cargarRegistros);
  $('btnGenerar').addEventListener('click', generarResumen);
  $('btnCopiar').addEventListener('click', copiarResumen);
  $('btnWhatsapp').addEventListener('click', abrirWhatsapp);
  $('btnOutlook').addEventListener('click', abrirOutlook);
  $('btnLimpiar').addEventListener('click', limpiarFormulario);

  ['fecha', 'turno', 'encargado'].forEach(id => {
    $(id).addEventListener('change', () => {
      localStorage.setItem('rs_' + id, $(id).value);
    });
  });
}

function saveConfig() {
  localStorage.setItem('rs_apiUrl', $('apiUrl').value.trim());
  localStorage.setItem('rs_apiToken', $('apiToken').value.trim());
  setStatus('Configuración guardada.', true);
}

function getConfig() {
  const apiUrl = $('apiUrl').value.trim();
  const token = $('apiToken').value.trim();
  if (!apiUrl || !token) throw new Error('Debes ingresar la URL de Apps Script y el token.');
  return { apiUrl, token };
}

function getTurnoBase() {
  const fecha = $('fecha').value;
  const turno = $('turno').value;
  const encargado = $('encargado').value.trim();
  if (!fecha || !turno || !encargado) throw new Error('Completa fecha, turno y encargado/a.');
  localStorage.setItem('rs_fecha', fecha);
  localStorage.setItem('rs_turno', turno);
  localStorage.setItem('rs_encargado', encargado);
  return { fecha, turno, encargado };
}

function getRegistro() {
  const base = getTurnoBase();
  return {
    ...base,
    tipo_registro: $('tipo_registro').value,
    funcionario: $('funcionario').value.trim(),
    movil: $('movil').value.trim(),
    cuadrante: $('cuadrante').value,
    lugar: $('lugar').value.trim(),
    direccion: $('direccion').value.trim(),
    modalidad: $('modalidad').value,
    horario_inicio: $('horario_inicio').value,
    horario_termino: $('horario_termino').value,
    comisaria: $('comisaria').value,
    funcionario_carabineros: $('funcionario_carabineros').value.trim(),
    tipo_novedad: $('tipo_novedad').value,
    observacion: $('observacion').value.trim(),
    orden: $('orden').value || ''
  };
}

async function guardarRegistro() {
  try {
    setStatus('Guardando registro...', true);
    const registro = getRegistro();
    const res = await callApi('guardarRegistro', { registro });
    if (!res.ok) throw new Error(res.error || 'No se pudo guardar.');
    setStatus('Registro guardado correctamente.', true);
    limpiarFormulario(false);
    await cargarRegistros();
  } catch (err) {
    setStatus(err.message, false);
  }
}

async function cargarRegistros() {
  try {
    const base = getTurnoBase();
    setStatus('Cargando registros...', true);
    const res = await callApi('listarRegistros', base);
    if (!res.ok) throw new Error(res.error || 'No se pudo cargar.');
    renderRegistros(res.registros || []);
    setStatus('Registros cargados.', true);
  } catch (err) {
    setStatus(err.message, false);
  }
}

async function generarResumen() {
  try {
    const base = getTurnoBase();
    setStatus('Generando resumen...', true);
    const res = await callApi('generarResumen', base);
    if (!res.ok) throw new Error(res.error || 'No se pudo generar resumen.');
    $('resumen').value = res.resumen || '';
    $('resumen').dataset.whatsappUrl = res.whatsapp_url || '';
    $('resumen').dataset.outlookUrl = res.outlook_url || '';
    setStatus(`Resumen generado con ${res.total || 0} registros.`, true);
  } catch (err) {
    setStatus(err.message, false);
  }
}

function renderRegistros(registros) {
  $('contador').textContent = `${registros.length} registros`;
  $('tbodyRegistros').innerHTML = registros.map(r => `
    <tr>
      <td>${escapeHtml(r.tipo_registro)}</td>
      <td>${escapeHtml(r.funcionario)}</td>
      <td>${escapeHtml(r.movil)}</td>
      <td>${escapeHtml(r.cuadrante)}</td>
      <td>${escapeHtml(r.lugar)}<br><small>${escapeHtml(r.direccion)}</small></td>
      <td>${escapeHtml(r.observacion)}</td>
    </tr>
  `).join('');
}

function limpiarFormulario(clearStatus = true) {
  ['funcionario', 'movil', 'lugar', 'direccion', 'horario_inicio', 'horario_termino', 'funcionario_carabineros', 'observacion', 'orden'].forEach(id => $(id).value = '');
  $('tipo_registro').value = TIPOS[0];
  $('cuadrante').value = '215';
  $('modalidad').value = 'No aplica';
  $('comisaria').value = 'No aplica';
  $('tipo_novedad').value = 'No aplica';
  if (clearStatus) setStatus('Formulario limpio.', true);
}

async function copiarResumen() {
  const text = $('resumen').value;
  if (!text) return setStatus('Primero genera el resumen.', false);
  await navigator.clipboard.writeText(text);
  setStatus('Resumen copiado al portapapeles.', true);
}

function abrirWhatsapp() {
  const text = $('resumen').value;
  if (!text) return setStatus('Primero genera el resumen.', false);
  const url = $('resumen').dataset.whatsappUrl || `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function abrirOutlook() {
  const text = $('resumen').value;
  if (!text) return setStatus('Primero genera el resumen.', false);
  const base = getTurnoBase();
  const subject = `Resumen de servicio - ${base.turno} - ${base.fecha}`;
  const url = $('resumen').dataset.outlookUrl || `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function callApi(action, data) {
  const { apiUrl, token } = getConfig();
  const payload = { ...data, action, token };
  return jsonp(apiUrl, payload);
}

// Usamos JSONP para evitar problemas de CORS al llamar Apps Script desde GitHub Pages.
function jsonp(url, payload) {
  return new Promise((resolve, reject) => {
    const callback = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    const sep = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${sep}callback=${callback}&payload=${encodeURIComponent(JSON.stringify(payload))}`;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('La solicitud tardó demasiado. Revisa la URL de Apps Script o el despliegue.'));
    }, 20000);

    window[callback] = (response) => {
      cleanup();
      resolve(response);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('No se pudo conectar con Apps Script. Revisa la URL del Web App.'));
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[callback];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    script.src = fullUrl;
    document.body.appendChild(script);
  });
}

function setStatus(message, ok) {
  const el = $('status');
  el.textContent = message || '';
  el.className = 'status ' + (ok ? 'ok' : 'err');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

init();
