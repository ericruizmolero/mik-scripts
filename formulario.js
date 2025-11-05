/**
 * FORMULARIO.JS - URL Híbrida con datos críticos y compresión
 * 
 * Este script intercepta el envío del formulario y crea una URL híbrida:
 * - Datos críticos (Email, Compañia, Sector, Tamaño-de-tu-empresa) → Parámetros directos
 * - Preguntas del formulario (Pregunta-1, Pregunta-2, p3.1-12.5, etc.) → Parámetros directos
 * - Datos básicos (Nombre, Municipio, Territorio, etc.) → Comprimidos (evita URLs largas)
 * - Las métricas se calculan en grafica-main.js desde los parámetros de preguntas
 * - Las medias sectoriales se obtienen de Google Sheets (para comparación)
 */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('email-form') || document.querySelector('form[data-form="multistep"]');
  if (!form) return;

  console.log('🔧 Formulario.js: Inicializando URL híbrida con datos críticos');


  // Asegura que Webflow no haga su redirect
  form.removeAttribute('redirect');
  form.removeAttribute('data-redirect');


  /**
   * Función principal de redirección con URL híbrida
   */
  function doRedirect(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }

    const formData = new FormData(form);
    
    // Debug: Mostrar todos los campos del formulario
    console.log('🔍 Debug - Todos los campos del formulario:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // 1. Obtener datos críticos del formulario (solo los esenciales)
    const sectorValue = formData.get('Sector') || '';
    
    // Obtener el texto visible del option seleccionado para Sector
    // Usar selectedIndex para obtener el option realmente seleccionado (no solo el primero con ese value)
    let sectorEspecifico = '';
    const sectorSelect = form.querySelector('#Sector');
    if (sectorSelect && sectorValue) {
      const selectedIndex = sectorSelect.selectedIndex;
      if (selectedIndex > 0) { // selectedIndex 0 es el placeholder "Selecciona tu sector*"
        const selectedOption = sectorSelect.options[selectedIndex];
        if (selectedOption) {
          sectorEspecifico = selectedOption.textContent.trim();
        }
      }
    }
    
    const criticalData = {
      Email: formData.get('Email') || '',
      Compañia: formData.get('Compañia') || '',
      Sector: sectorValue,
      'Tamaño-de-tu-empresa': formData.get('Tamaño-de-tu-empresa') || formData.get('Tama-o-de-tu-empresa') || ''
    };
    
    console.log('🔍 Debug - Datos críticos encontrados:', criticalData);
    console.log('🔍 Debug - Sector específico:', sectorEspecifico);
    
    // 2. Obtener resultados de las preguntas (para que grafica-main.js pueda calcular las métricas)
    const questionResults = {};
    for (let [key, value] of formData.entries()) {
      // Incluir todas las preguntas (Pregunta-1, Pregunta-2, etc.)
      if (key.startsWith('Pregunta-') || key.startsWith('p') || key === 'pf1' || key === 'pf2') {
        questionResults[key] = value;
      }
    }
    
    // 3. Crear parámetros críticos (datos críticos + preguntas)
    const criticalParams = new URLSearchParams();
    
    // Agregar datos críticos
    Object.entries(criticalData).forEach(([key, value]) => {
      if (value) criticalParams.append(key, value);
    });
    
    // Agregar resultados de preguntas
    Object.entries(questionResults).forEach(([key, value]) => {
      if (value) criticalParams.append(key, value);
    });
    
    // 4. Preparar datos básicos para comprimir (todo lo que no sea crítico)
    const basicData = {};
    for (let [key, value] of formData.entries()) {
      // Solo incluir datos que no sean críticos
      if (!criticalData.hasOwnProperty(key) && !questionResults.hasOwnProperty(key)) {
        basicData[key] = value;
      }
    }
    
    // Añadir el sector específico si aún no está incluido
    if (sectorEspecifico && !basicData['Sector-Especifico']) {
      basicData['Sector-Especifico'] = sectorEspecifico;
    }
    
    // 5. Construir URL híbrida
    let redirectUrl = '/resultado?' + criticalParams.toString();
    
    // 6. Si hay datos básicos, comprimirlos y agregarlos
    if (Object.keys(basicData).length > 0) {
      const basicJson = JSON.stringify(basicData);
      const compressed = btoa(basicJson);
      redirectUrl += '&data=' + encodeURIComponent(compressed) + '&compressed=true';
      console.log('📦 Datos básicos comprimidos:', Object.keys(basicData).length, 'campos');
    }
    
    console.log('🚀 Redirigiendo con URL híbrida');
    console.log(`🔗 URL final: ${redirectUrl.length} caracteres`);
    console.log('📊 Datos críticos incluidos:', Object.keys(criticalData).filter(k => criticalData[k]).length);
    console.log('📊 Preguntas incluidas:', Object.keys(questionResults).length);
    console.log('ℹ️ Las métricas se calcularán en grafica-main.js desde los parámetros de preguntas');
    
    window.location.href = redirectUrl;
  }

  // Intercepta el submit en CAPTURA y en BURBUJA, por si acaso
  form.addEventListener('submit', doRedirect, true);
  form.addEventListener('submit', doRedirect, false);

  // Intercepta el click del botón final también
  const submitBtn = form.querySelector('[data-form="submit-btn"], [type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      doRedirect(e);
    });
  }

  // Quita los mensajes nativos del DOM para que no puedan mostrarse
  const wform = form.closest('.w-form');
  if (wform) {
    const done = wform.querySelector('.w-form-done');
    const fail = wform.querySelector('.w-form-fail');
    if (done) done.remove();
    if (fail) fail.remove();
  }

  console.log('✅ Formulario.js: Submit interceptado con compresión de datos');
});

/**
 * Función para decodificar datos comprimidos (usada en sheets.js)
 */
window.decodeFormData = function(compressedData) {
  try {
    const decoded = atob(compressedData);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Error decodificando datos comprimidos:', error);
    return null;
  }
};
