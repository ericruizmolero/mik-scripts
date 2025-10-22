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

    // --- Detectar Safari y manejar problemas específicos ---
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log(`🌐 [Printable] Navegador detectado: ${isSafari ? 'Safari' : 'Otro'}`);
    console.log(`🌐 [Printable] User Agent: ${navigator.userAgent}`);
    console.log(`🌐 [Printable] ¿Es Safari? ${isSafari}`);

    // --- Safari: Usar método alternativo sin html2pdf.js ---
    if (isSafari) {
      console.log('🍎 Safari detectado: Usando método alternativo de impresión');
      console.log('🍎 Safari: Iniciando método window.print()...');
      try {
        // Método 1: Usar window.print() con CSS específico
        const printWindow = window.open('', '_blank');
        const printContent = area.innerHTML;
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Resultados GSBIndex - ${empresa}</title>
            <style>
              @page { 
                size: A4 landscape; 
                margin: 0; 
              }
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                transform: scale(0.8);
                transform-origin: top left;
              }
              * { 
                box-sizing: border-box; 
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              };
            </script>
          </body>
          </html>
        `);
        
        printWindow.document.close();
        console.log('✅ Safari: Ventana de impresión abierta');
        return;
        
      } catch (printErr) {
        console.warn('⚠️ Safari: Fallo en método de impresión:', printErr.message);
        console.log('🔄 Safari: Intentando fallback con html2pdf simplificado...');
        
        try {
          // Fallback: Descarga directa con html2pdf simplificado
          const simpleOpts = {
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.6 },
            html2canvas: { 
              scale: 0.8, 
              useCORS: true, 
              logging: false,
              allowTaint: true,
              backgroundColor: '#ffffff'
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'landscape',
              compress: true
            }
          };
          
          console.log('🔄 Safari: Generando PDF con opciones simplificadas...');
          await html2pdf().set(simpleOpts).from(area).save();
          console.log('✅ Safari: PDF descargado como fallback');
          return;
          
        } catch (fallbackErr) {
          console.error('❌ Safari: Error también en fallback:', fallbackErr.message);
          console.log('🍎 Safari: Intentando método de emergencia...');
          
          // Método de emergencia: Solo mostrar mensaje
          alert(`Safari detectado: Por favor, usa Ctrl+P (Cmd+P en Mac) para imprimir esta página.\n\nEmpresa: ${empresa}\nEmail: ${to || 'No especificado'}`);
          return;
        }
      }
    }

    // --- Otros navegadores: Usar html2pdf.js normal ---
    console.log('🔄 [Printable] Iniciando generación de PDF...');
    const worker = html2pdf().set(opts).from(area).toPdf();
    console.log('🔄 [Printable] Worker creado, obteniendo PDF...');
    
    // Añadir timeout específico para worker.get('pdf')
    const pdfPromise = worker.get('pdf');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout en worker.get("pdf") - 30 segundos')), 30000)
    );
    
    const pdf = await Promise.race([pdfPromise, timeoutPromise]);
    console.log('🔄 [Printable] PDF obtenido, generando data URI...');
    const dataUri = pdf.output('datauristring');
    console.log('🔄 [Printable] Data URI generado, extrayendo base64...');
    const pdfBase64 = dataUri.split(',')[1];
    console.log('✅ [Printable] PDF generado correctamente, tamaño base64:', pdfBase64.length);

    // --- Enviar por email o descargar como fallback ---
    if (hasEmail) {
      console.log('📧 [Printable] Preparando envío de email...');
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

      console.log('📤 [Printable] Enviando email a:', to);
      console.log('📤 [Printable] Tamaño del payload:', JSON.stringify(payload).length, 'caracteres');
      
      const resp = await fetch('https://email-send-sigma.vercel.app/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('📤 [Printable] Respuesta del servidor:', resp.status, resp.statusText);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const errorMsg = err.error || 'Error enviando el email';
        
        if (isSafari) {
          console.warn(`🍎 Safari: Fallo al enviar email (${errorMsg}), descargando PDF localmente como fallback`);
        } else {
          console.warn(`Fallo al enviar email (${errorMsg}), se descargará el PDF localmente.`);
        }
        
        await html2pdf().set(opts).from(area).save();
        return; // No lanzar error, solo hacer fallback
      }

      console.log(`✅ PDF enviado correctamente a ${to}`);
    } else {
      console.warn('No se encontró email en la URL. Descargando el PDF localmente.');
      await html2pdf().set(opts).from(area).save();
    }

  } catch (err) {
    console.error('❌ Error:', err);
    
    // Si es timeout en worker.get('pdf'), intentar con formato más simple
    if (err.message && err.message.includes('Timeout en worker.get')) {
      console.warn('⏰ Timeout en generación de PDF, intentando con formato A4 estándar...');
      try {
        const simpleOpts = {
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.8 },
          html2canvas: { scale: 1.5, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        await html2pdf().set(simpleOpts).from(area).save();
        console.log('✅ PDF generado con formato A4 estándar como fallback');
        return;
      } catch (fallbackErr) {
        console.error('❌ Error también en fallback A4:', fallbackErr);
      }
    }
    
    // Si es Safari y hay un error, intentar descarga como último recurso
    if (isSafari) {
      console.warn('🍎 Safari: Error durante el proceso, intentando descarga directa como último recurso');
      try {
        await html2pdf().set(opts).from(area).save();
      } catch (downloadErr) {
        console.error('❌ Error también en descarga:', downloadErr);
      }
    }
  }
}

// Sistema simple: Ejecutar printable.js exactamente a los 10 segundos
console.log('📄 printable.js cargado - Ejecutando en 10 segundos...');

setTimeout(() => {
  console.log('⏰ [Printable] Ejecutando printable.js después de 10 segundos...');
  initializePrintable();
}, 10000); // Exactamente 10 segundos
