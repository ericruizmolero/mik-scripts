/**
 * Genera un PDF A4 desde #printable con escala inteligente y lo envía por email si hay ?email=... en la URL.
 * - Si no hay email o el envío falla, descarga el PDF localmente.
 * - El cuerpo del email es simple (solo texto con HTML básico) e incluye un enlace a la guía.
 * - ESPERA a que los resultados estén completamente cargados antes de ejecutarse.
 */

// Función principal que se ejecuta cuando todo está listo
async function initializePrintable() {
  const area = document.getElementById('printable');
  if (!area) {
    console.error('No se encontró el elemento #printable.');
    return;
  }

  if (typeof html2pdf === 'undefined') {
    alert('No se cargó html2pdf.js');
    return;
  }

  // --- Parámetros desde la URL o datos decodificados ---
  const params = new URLSearchParams(window.location.search);
  
  // Buscar email en URL o en datos decodificados
  let rawEmail = params.get('Email') || params.get('email') || '';
  let nombre = decodeURIComponent(params.get('Nombre') || '').trim() || 'Usuario';
  let empresa = decodeURIComponent(params.get('Compañia') || params.get('Compania') || '').trim() || 'tu empresa';
  
  // Si no hay datos en URL pero hay datos decodificados, usarlos
  if (!rawEmail && window.decodedFormData) {
    console.log('📧 [Printable] Buscando email en datos decodificados...');
    rawEmail = window.decodedFormData.Email || window.decodedFormData.email || '';
    nombre = window.decodedFormData.Nombre || 'Usuario';
    empresa = window.decodedFormData['Compañia'] || window.decodedFormData.Compania || 'tu empresa';
    console.log('📧 [Printable] Email encontrado en datos decodificados:', rawEmail);
  }
  
  const to = (rawEmail || '').trim();
  const hasEmail = !!to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);

  // --- Configuración simplificada ---

  // Utilidades
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitForImages = (root) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
      })
    );
  };

  // Crear nombre de archivo profesional
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const empresaLimpia = empresa
    .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
    .substring(0, 30); // Limitar longitud
  
  const filename = `Resultados_GSBIndex_${empresaLimpia}_${fecha}.pdf`;

  try {
    // --- Esperar fuentes e imágenes ---
    if (document.fonts && document.fonts.ready) {
      try { await Promise.race([document.fonts.ready, wait(1500)]); } catch {}
    }
    await waitForImages(area);
    await wait(300);

    // --- Opciones de html2pdf con formato custom ---
    // Ratio real: width:height = 911.67:3526 ≈ 1:3.87 (ancho:alto)
    // Necesitamos formato vertical alto para que encaje bien
    
    // Calcular dimensiones custom manteniendo el ratio real 1:3.87
    // El alto debe ser 3.87 veces el ancho (formato vertical alto)
    const customWidth = 350; // Ancho base (500mm)
    const customHeight = customWidth * 3.87; // Alto = ancho × 3.87
    
    console.log(`📐 [Printable] Formato custom: ${customWidth}mm x ${customHeight.toFixed(1)}mm (ratio 1:3.87)`);
    
    const opts = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { 
        unit: 'mm', 
        format: [customWidth, customHeight], // [ancho, alto] - formato vertical alto
        orientation: 'portrait'
      }
    };

    // --- Generar PDF directamente desde el elemento ---
    const worker = html2pdf().set(opts).from(area).toPdf();
    const pdf = await worker.get('pdf');
    const dataUri = pdf.output('datauristring');
    const pdfBase64 = dataUri.split(',')[1];

    // --- Enviar por email o descargar como fallback ---
    if (hasEmail) {
      const guiaUrl = "https://cdn.prod.website-files.com/68e4d9e76fdc64594468b12e/68efc759c7a2aae932ce61d5_Copia%20de%20ANEXO%201__GUIA.pdf";
      
      // --- Email simple y limpio ---
      const htmlEmail = `
        <p>Hola,</p>
        <p>Ya tienes disponible el informe personalizado con los resultados de sostenibilidad de <strong>${empresa}</strong>.</p>
        <p>Este PDF incluye tu puntuación global, los indicadores de cada pilar —ambiental, social y de gobernanza— y una comparativa con la media del sector.</p>
        <p>Además, puedes consultar la <a href="${guiaUrl}" target="_blank">guía</a> de interpretación y mejora del triple impacto, donde encontrarás orientaciones y ejemplos para avanzar hacia una sostenibilidad más sólida.</p>
        <p>Gracias por confiar en nosotros para medir y mejorar el impacto de tu organización.</p>
        <p style="color:#999;font-size:12px;">MIK - Mondragón Investigación en Gestión y GSBIndex por MIK S. Coop.</p>
      `;

      const payload = {
        to,
        subject: `Resultados de triple impacto GSBindex de ${empresa}`,
        html: htmlEmail,
        pdfBase64,
        filename
      };

      const resp = await fetch('https://email-send-sigma.vercel.app/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        console.warn('Fallo al enviar email, se descargará el PDF localmente.');
        await html2pdf().set(opts).from(area).save();
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error enviando el email');
      }

      console.log(`✅ PDF enviado correctamente a ${to}`);
    } else {
      console.warn('No se encontró email en la URL. Descargando el PDF localmente.');
      await html2pdf().set(opts).from(area).save();
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Sistema de espera: Solo ejecutar cuando todas las gráficas estén listas
let printableInitialized = false;
let graphicsReady = {
  main: false,
  ambiental: false,
  social: false,
  gobernanza: false
};

console.log('📄 printable.js cargado - Esperando que todas las gráficas estén listas...');

// Función para verificar si todas las gráficas están listas
function checkAllGraphicsReady() {
  console.log('🔍 [Printable] Verificando estado de gráficas:', graphicsReady);
  
  const allReady = graphicsReady.main && graphicsReady.ambiental && graphicsReady.social && graphicsReady.gobernanza;
  
  console.log('🔍 [Printable] Todas las gráficas listas?', allReady);
  console.log('🔍 [Printable] printableInitialized?', printableInitialized);
  
  if (allReady && !printableInitialized) {
    console.log('🎯 Todas las gráficas están listas - Esperando a que se muestren los resultados...');
    // NO inicializar printable.js aquí - esperar al evento gsbResultsReady
  }
}

// Escuchar eventos de cada gráfica
window.addEventListener('gsbMainGraphicsReady', () => {
  console.log('✅ [Printable] Gráficas principales listas');
  graphicsReady.main = true;
  console.log('🔍 [Printable] Estado actualizado:', graphicsReady);
  checkAllGraphicsReady();
});

window.addEventListener('gsbAmbientalGraphicsReady', () => {
  console.log('✅ [Printable] Gráficas ambientales listas');
  graphicsReady.ambiental = true;
  console.log('🔍 [Printable] Estado actualizado:', graphicsReady);
  checkAllGraphicsReady();
});

window.addEventListener('gsbSocialGraphicsReady', () => {
  console.log('✅ [Printable] Gráficas sociales listas');
  graphicsReady.social = true;
  console.log('🔍 [Printable] Estado actualizado:', graphicsReady);
  checkAllGraphicsReady();
});

window.addEventListener('gsbGobernanzaGraphicsReady', () => {
  console.log('✅ [Printable] Gráficas de gobernanza listas');
  graphicsReady.gobernanza = true;
  console.log('🔍 [Printable] Estado actualizado:', graphicsReady);
  checkAllGraphicsReady();
});

// Mantener eventos anteriores como fallback
window.addEventListener('gsbDataSent', (event) => {
  console.log('📄 [Printable] Datos enviados a Google Sheets (fallback)');
  // No ejecutar inmediatamente, esperar a que las gráficas estén listas
});

window.addEventListener('gsbResultsReady', () => {
  if (!printableInitialized) {
    console.log('📄 [Printable] Resultados listos - Inicializando printable.js');
    printableInitialized = true;
    setTimeout(() => {
      initializePrintable();
    }, 8000);
  }
});

// Fallback: Si después de 16 segundos no se ha recibido el evento, ejecutar de todas formas
setTimeout(() => {
  if (!printableInitialized) {
    console.warn('⚠️ Timeout: Ejecutando printable.js sin confirmación de resultados listos (16s)');
    printableInitialized = true;
    initializePrintable();
  }
}, 16000); // 16 segundos (8s para gráficas + 8s para PDF)

// También ejecutar cuando el DOM esté listo (para casos donde no hay medias sectoriales)
document.addEventListener('DOMContentLoaded', () => {
  // Solo ejecutar si no hay sistema de medias sectoriales o si ya pasó suficiente tiempo
  if (!window.gsbSheets) {
    console.log('📄 Inicializando printable.js - No hay sistema de medias sectoriales');
    setTimeout(() => {
      if (!printableInitialized) {
        printableInitialized = true;
        initializePrintable();
      }
    }, 10000); // Esperar 10 segundos (8s para gráficas + 2s adicionales)
  }
});
