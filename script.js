const $ = (id) => document.getElementById(id);

// Si quieres que los encargados no vean configuración, pega aquí la URL final del Web App.
// También se puede guardar desde el botón "Configuración técnica" de la página.
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbyCpDXuSviRGT6nZlxYM_jD9jfGrqjBVDKceZOQye4DTOHVU_1EzJ_ivdCs5PNKVLQj/exec';

const TIPOS = [
  'Distribución de cuadrante',
  'Servicio con Carabineros',
  'Plan Colegio',
  'Patrullaje preventivo solicitado',
  'Vigilancia especial',
  'Punto fijo / breve punto fijo',
  'Copamiento / actividad especial',
  'Fiscalización',
  'Recuperación de espacio público',
  'Móviles operativos',
  'Servicio extraordinario',
  'Novedad de personal',
  'Observación general'
];

const TIPOS_RAPIDOS = [
  'Servicio con Carabineros',
  'Plan Colegio',
  'Vigilancia especial',
  'Copamiento / actividad especial',
  'Móviles operativos',
  'Novedad de personal'
];

const CUADRANTES = [
  '215', '215-A', '215-B', '215-C',
  '216', '217', '218', '219', '220', '221', '222', '223', '223-A', '223-B',
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
  'Patrulla mixta apoyo a cuadrante',
  'Plan Colegio',
  'Fiscalización',
  'Recuperación de espacio público',
  'Copamiento',
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
  renderQuickTypes();

  const today = new Date().toISOString().slice(0, 10);
  $('fecha').value = localStorage.getItem('rs_fecha') || today;
  $('turno').value = localStorage.getItem('rs_turno') || '1° turno';
  $('encargado').value = localStorage.getItem('rs_encargado') || '';
  $('apiUrl').value = localStorage.getItem('rs_apiUrl') || DEFAULT_API_URL;

  $('btnConfig').addEventListener('click', () => $('configBox').classList.toggle('hidden'));
  $('btnSaveConfig').addEventListener('click', saveConfig);
  $('btnGuardar').addEventListener('click', guardarRegistro);
  $('btnCargar').addEventListener('click', cargarRegistros);
  $('btnGenerar').addEventListener('click', generarResumen);
  $('btnCopiar').addEventListener('click', copiarResumen);
  $('btnWhatsapp').addEventListener('click', abrirWhatsapp);
  $('btnOutlook').addEventListener('click', abrirOutlook);
  $('btnLimpiar').addEventListener('click', limpiarFormulario);
  $('tipo_registro').addEventListener('change', aplicarTipoSeleccionado);

  ['fecha', 'turno', 'encargado'].forEach(id => {
    $(id).addEventListener('change', () => {
      localStorage.setItem('rs_' + id, $(id).value);
    });
  });

  aplicarTipoSeleccionado();
}

function renderQuickTypes() {
  const box = $('quickTypes');
  box.innerHTML = TIPOS_RAPIDOS.map(t => `<button type="button" class="chip" data-tipo="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
  box.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      $('tipo_registro').value = btn.dataset.tipo;
      aplicarTipoSeleccionado();
      $('funcionario').focus();
    });
  });
}

function aplicarTipoSeleccionado() {
  const tipo = $('tipo_registro').value;

  const defaults = {
    'Distribución de cuadrante': { modalidad: 'No aplica', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Servicio con Carabineros': { modalidad: 'Medidas cautelares', lugar: '', comisaria: '25° Comisaría', novedad: 'No aplica' },
    'Plan Colegio': { modalidad: 'Plan Colegio', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Patrullaje preventivo solicitado': { modalidad: 'Patrullaje preventivo', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Vigilancia especial': { modalidad: 'Breve punto fijo', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Punto fijo / breve punto fijo': { modalidad: 'Breve punto fijo', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Copamiento / actividad especial': { modalidad: 'Copamiento', lugar: 'Servicio copamiento', comisaria: 'No aplica', novedad: 'No aplica' },
    'Fiscalización': { modalidad: 'Fiscalización', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Recuperación de espacio público': { modalidad: 'Recuperación de espacio público', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Móviles operativos': { modalidad: 'No aplica', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Servicio extraordinario': { modalidad: 'Otro', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' },
    'Novedad de personal': { modalidad: 'No aplica', lugar: '', comisaria: 'No aplica', novedad: 'Licencia médica' },
    'Observación general': { modalidad: 'No aplica', lugar: '', comisaria: 'No aplica', novedad: 'No aplica' }
  };

  const d = defaults[tipo] || defaults['Distribución de cuadrante'];
  $('modalidad').value = d.modalidad;
  $('comisaria').value = d.comisaria;
  $('tipo_novedad').value = d.novedad;
  if (d.lugar && !$('lugar').value) $('lugar').value = d.lugar;

  setPlaceholderByTipo(tipo);
}

function setPlaceholderByTipo(tipo) {
  const obs = $('observacion');
  const lugar = $('lugar');
  const direccion = $('direccion');

  if (tipo === 'Servicio con Carabineros') {
    lugar.placeholder = 'Ej.: Medidas cautelares / Patrulla mixta apoyo a cuadrante';
    direccion.placeholder = 'Jurisdicción o sector, si aplica';
    obs.placeholder = 'Ej.: servicio de medidas cautelares y órdenes judiciales';
  } else if (tipo === 'Plan Colegio') {
    lugar.placeholder = 'Ej.: Colegio Reina de Suecia';
    direccion.placeholder = 'Ej.: Av. Arq. Hugo Bravo #1677';
    obs.placeholder = 'Observación opcional';
  } else if (tipo === 'Vigilancia especial' || tipo === 'Punto fijo / breve punto fijo') {
    lugar.placeholder = 'Ej.: Jardín Infantil El Despertar';
    direccion.placeholder = 'Ej.: Asunción #1441';
    obs.placeholder = 'Ej.: vigilancia con breve punto fijo por desalojo de campamento';
  } else if (tipo === 'Copamiento / actividad especial') {
    lugar.placeholder = 'Ej.: Servicio copamiento Feria El Descanso';
    direccion.placeholder = 'Ej.: Av. El Descanso entre Longitudinal y Gustavo Eiffel';
    obs.placeholder = 'Ej.: con relevo en el lugar';
  } else if (tipo === 'Móviles operativos') {
    lugar.placeholder = 'Opcional';
    direccion.placeholder = 'Opcional';
    obs.placeholder = 'Ej.: cobertura todos los cuadrantes / cuadrante 219/220';
  } else if (tipo === 'Novedad de personal') {
    lugar.placeholder = 'No aplica';
    direccion.placeholder = 'No aplica';
    obs.placeholder = 'Ej.: funcionario con licencia médica';
  } else {
    lugar.placeholder = 'Lugar, servicio o punto';
    direccion.placeholder = 'Dirección o intersección';
    obs.placeholder = 'Detalle breve del servicio, motivo o novedad';
  }
}

function saveConfig() {
  localStorage.setItem('rs_apiUrl', $('apiUrl').value.trim());
  setStatus('URL guardada.', true);
}

function getConfig() {
  const apiUrl = ($('apiUrl').value.trim() || DEFAULT_API_URL).trim();
  if (!apiUrl) throw new Error('Falta configurar la URL de Apps Script.');
  return { apiUrl };
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
    setStatus('Guardando servicio...', true);
    const registro = getRegistro();
    const res = await callApi('guardarRegistro', { registro });
    if (!res.ok) throw new Error(res.error || 'No se pudo guardar.');
    setStatus('Servicio guardado correctamente.', true);
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
  aplicarTipoSeleccionado();
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
  const { apiUrl } = getConfig();
  const payload = { ...data, action };
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
