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
  
  // waitForImages con timeout máximo para evitar bloqueos
  const waitForImages = (root, maxWait = 5000) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    if (!imgs.length) {
      console.log('📸 [Printable] No hay imágenes que esperar');
      return Promise.resolve();
    }
    
    console.log(`📸 [Printable] Esperando ${imgs.length} imagen(es) (máximo ${maxWait}ms)...`);
    
    // Crear un timeout global que fuerza la resolución
    const timeoutPromise = wait(maxWait).then(() => {
      console.log(`⚠️ [Printable] Timeout alcanzado para imágenes, continuando...`);
    });
    
    // Esperar todas las imágenes con timeout individual de 2 segundos por imagen
    const imagePromises = imgs.map((img, index) => {
      if (img.complete) {
        console.log(`✅ [Printable] Imagen ${index + 1} ya cargada`);
        return Promise.resolve();
      }
      
      return Promise.race([
        new Promise((res) => {
          img.addEventListener('load', () => {
            console.log(`✅ [Printable] Imagen ${index + 1} cargada`);
            res();
          }, { once: true });
          img.addEventListener('error', () => {
            console.log(`⚠️ [Printable] Imagen ${index + 1} falló al cargar`);
            res(); // Resolver igual para continuar
          }, { once: true });
        }),
        wait(2000).then(() => {
          console.log(`⏱️ [Printable] Timeout para imagen ${index + 1}`);
        })
      ]);
    });
    
    // Combinar todos los promises con un timeout global
    return Promise.race([
      Promise.all(imagePromises),
      timeoutPromise
    ]).then(() => {
      console.log('📸 [Printable] Espera de imágenes completada');
    });
  };

  // Crear nombre de archivo profesional
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const empresaLimpia = empresa
    .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
    .substring(0, 30); // Limitar longitud
  
  const filename = `Resultados_GSBIndex_${empresaLimpia}_${fecha}.pdf`;

  try {
    console.log('⏳ [Printable] Iniciando proceso de generación...');
    
    // --- Esperar fuentes e imágenes ---
    console.log('⏳ [Printable] Esperando fuentes...');
    if (document.fonts && document.fonts.ready) {
      try { 
        await Promise.race([document.fonts.ready, wait(1500)]); 
        console.log('✅ [Printable] Fuentes listas');
      } catch (e) {
        console.log('⚠️ [Printable] Timeout en fuentes, continuando...');
      }
    } else {
      console.log('⚠️ [Printable] document.fonts no disponible, continuando...');
    }
    
    console.log('⏳ [Printable] Esperando imágenes...');
    await waitForImages(area);
    
    console.log('⏳ [Printable] Espera final de 300ms...');
    await wait(300);
    console.log('✅ [Printable] Todas las esperas completadas');

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

    // --- Bloquear Safari completamente ---
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      console.log('🍎 Safari detectado: Printable.js bloqueado para Safari');
      console.log('🍎 Safari: Usa Ctrl+P (Cmd+P en Mac) para imprimir esta página');
      return;
    }

    // --- Generar PDF directamente desde el elemento ---
    console.log('🔄 [Printable] Iniciando generación de PDF...');
    
    // Timeout de seguridad para la generación del PDF (30 segundos)
    const pdfGenerationPromise = (async () => {
      const worker = html2pdf().set(opts).from(area).toPdf();
      const pdf = await worker.get('pdf');
      const dataUri = pdf.output('datauristring');
      const pdfBase64 = dataUri.split(',')[1];
      return pdfBase64;
    })();
    
    const pdfBase64 = await Promise.race([
      pdfGenerationPromise,
      wait(30000).then(() => {
        throw new Error('Timeout: La generación del PDF tardó demasiado (30s)');
      })
    ]);
    
    console.log('✅ [Printable] PDF generado correctamente');

    // --- Enviar por email siempre ---
    console.log('📧 [Printable] Preparando envío de email...');
    const guiaUrl = "https://cdn.prod.website-files.com/68e4d9e76fdc64594468b12e/6926b62ec3cf8ad58dfeb5d3_GUIA%20GSBI%20DESCARGA%20WEB_compressed.pdf";
    
// --- Email simple y limpio ---
const htmlEmail = `
  <p>Hola,</p>
  <p>Ya tienes disponible el informe personalizado con los resultados de sostenibilidad de <strong>${empresa}</strong>.</p>
  <p>Este PDF incluye tu puntuación global, los indicadores de cada pilar —ambiental, social y de gobernanza— y una comparativa con la media del sector.</p>
  <p>Además, puedes consultar la <a href="${guiaUrl}" target="_blank">guía</a> de interpretación y mejora del triple impacto, donde encontrarás orientaciones y ejemplos para avanzar hacia una sostenibilidad más sólida adaptada a tus necesidades.</p>
  <p>Gracias por confiar en nosotros para medir y mejorar el impacto de tu organización.</p>

  <p style="color:#666;font-size:12px;line-height:1.4;">
    <strong>Nota:</strong> Estos resultados comparan tus respuestas con la muestra GSBI y tienen un carácter orientativo.
    No deben interpretarse como una evaluación concluyente o como una certificación del desempeño de tu empresa en materia de sostenibilidad,
    ni tampoco usarse en informes o comunicaciones que sugieran que MIK S.Coop. respalda su actuación.
  </p>

  <p style="color:#999;font-size:11px;font-style:italic;margin-top:10px;">
    © MIK S. Coop. Este informe se distribuye bajo Licencia Creative Commons BY-NC-ND 4.0.<br>
    Se permite su copia y redistribución con reconocimiento de autoría, sin fines comerciales y sin modificaciones.
  </p>
  
  <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;">
  
  <div style="font-family: Arial, sans-serif; color: #333;">
    <a href="https://www.mondragon.edu/eu/hasiera" target="_blank" style="display: inline-block; margin-bottom: 15px;">
      <img src="https://cdn.prod.website-files.com/68e4d9e76fdc64594468b12e/69088db0cd6431eae3d110fd_Mik_hiru%20hizkuntza%20horizontal%20txuria%201.png" width="400" alt="MIK Logo" style="max-width: 100%; height: auto;">
    </a>
    
    <div style="font-weight: bold; color: #005A42; margin-bottom: 5px;">Equipo de Sostenibilidad y Negocios Circulares</div>
    
    <div style="font-size: 12px; color: #005A42; opacity: 0.8; margin-bottom: 15px;">
      <a href="mailto:info@gsbindex.com" target="_blank" style="color: inherit; text-decoration: none;">info@gsbindex.com</a>
    </div>
    
    <div style="font-weight: bold; color: #005A42; margin-bottom: 5px;">MIK S.Coop. | Mondragon Unibertsitatea | Enpresagintza Fakultatea</div>
    
    <div style="font-size: 12px; color: #005A42; opacity: 0.8; line-height: 1.5;">
      <a href="https://www.google.com/maps/dir//Edificio+Palmera+Montero,+Leandro+Agirretxe+Plazatxoa,+20304+Irun,+Gipuzkoa/@42.8048384,-1.654784,6946m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0xd510859d7470ccf:0xfe75152882d7dcb2!2m2!1d-1.7809546!2d43.3391079?entry=ttu&amp;g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D" target="_blank" style="color: inherit; text-decoration: none;">Edificio Palmera Montero, Leandro Agirretxe Plazatxoa, 20304 Irun, Gipuzkoa</a>
      <span style="margin: 0 5px;">|</span>
      <a href="https://www.mondragon.edu/eu/hasiera" target="_blank" style="color: inherit; text-decoration: none;">www.mondragon.edu</a>
      <span style="margin: 0 5px;">|</span>
      <a href="https://mik.mondragon.edu/es/inicio" target="_blank" style="color: inherit; text-decoration: none;">https://mik.mondragon.edu/es/inicio</a>
      <span style="margin: 0 5px;">|</span>
      <a href="https://www.linkedin.com/in/borja-diez-canamero" target="_blank" style="color: inherit; text-decoration: none;">Agrégame en LinkedIn</a>
    </div>
  </div>
`;

    // Usar email de la URL o un email por defecto si no hay
    const emailDestino = hasEmail ? to : 'info@mik.eus'; // Email por defecto si no hay en la URL
    
    const payload = {
      to: emailDestino,
      subject: `Resultados de triple impacto GSBindex de ${empresa}`,
      html: htmlEmail,
      pdfBase64,
      filename
    };

    // Preparar logs
    console.log('📤 [Printable] Enviando email a:', emailDestino);
    if (!hasEmail) {
      console.log('📤 [Printable] No se encontró email en la URL, usando email por defecto');
    }
    
    const payloadSize = JSON.stringify(payload).length;
    const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
    console.log('📤 [Printable] Tamaño del payload:', payloadSize, 'caracteres (' + payloadSizeMB + ' MB)');
    
    // Crear un timeout para el fetch (30 segundos)
    const fetchWithTimeout = (url, options, timeout = 30000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), timeout)
        )
      ]);
    };
    
    // Función para enviar el email (intenta primero sin keepalive, luego con keepalive si falla)
    const sendEmail = async (useKeepalive = false) => {
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };
      
      // Solo usar keepalive si el payload es pequeño (< 64KB)
      // keepalive tiene limitaciones de tamaño en algunos navegadores
      if (useKeepalive && payloadSize < 65536) {
        fetchOptions.keepalive = true;
        console.log('📤 [Printable] Intentando envío con keepalive (payload pequeño)');
      } else if (useKeepalive) {
        console.log('📤 [Printable] Payload demasiado grande para keepalive, usando fetch normal');
      } else {
        console.log('📤 [Printable] Intentando envío con fetch estándar');
      }
      
      return await fetchWithTimeout('https://email-send-sigma.vercel.app/api/send-email', fetchOptions);
    };
    
    // Intentar enviar el email
    try {
      let resp;
      let lastError;
      
      // Primer intento: sin keepalive (mejor para payloads grandes)
      try {
        resp = await sendEmail(false);
      } catch (error) {
        console.warn('⚠️ [Printable] Primer intento falló:', error.message);
        lastError = error;
        
        // Segundo intento: con keepalive solo si el payload es pequeño
        if (payloadSize < 65536) {
          console.log('🔄 [Printable] Reintentando con keepalive...');
          try {
            resp = await sendEmail(true);
          } catch (error2) {
            console.error('❌ [Printable] Segundo intento también falló:', error2.message);
            throw error2; // Lanzar el error más reciente
          }
        } else {
          throw error; // Si el payload es grande, no intentar con keepalive
        }
      }
      
      const status = resp.status;
      const statusText = resp.statusText;
      console.log('📤 [Printable] Respuesta del servidor:', status, statusText);

      // Si la respuesta es 200, el email se envió correctamente
      if (status === 200 || resp.ok) {
        console.log(`✅ PDF enviado correctamente a ${emailDestino}`);
        
        // Leer la respuesta en segundo plano sin bloquear (opcional)
        resp.json().then((data) => {
          console.log('✅ [Printable] Confirmación de envío recibida:', data);
        }).catch(() => {
          // Ignorar errores - el status 200 ya confirma que se envió
        });
        
        // Salir inmediatamente - el email se envió correctamente
        return;
      }

      // Si no es 200, manejar el error
      const err = await resp.json().catch(() => ({}));
      const errorMsg = err.error || 'Error enviando el email';
      console.warn(`⚠️ Fallo al enviar email (${errorMsg}), se descargará el PDF localmente como fallback.`);
      await html2pdf().set(opts).from(area).save();
      
    } catch (fetchError) {
      console.error('❌ Error en el fetch:', fetchError);
      console.error('❌ Tipo de error:', fetchError.name || 'Unknown');
      console.error('❌ Mensaje:', fetchError.message || 'Sin mensaje');
      
      // Información adicional sobre el error
      if (fetchError.message?.includes('Failed to fetch')) {
        console.error('💡 Posibles causas:');
        console.error('   - Problema de red/CORS');
        console.error('   - El servidor rechazó la conexión');
        console.error('   - Payload demasiado grande (' + payloadSizeMB + ' MB)');
      }
      
      console.warn('📥 Se descargará el PDF localmente como fallback debido a error de red.');
      await html2pdf().set(opts).from(area).save();
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Sistema robusto: Ejecutar printable.js después de 9.1 segundos
// Usa múltiples estrategias para evitar throttling del navegador en pestañas en segundo plano
console.log('📄 printable.js cargado - Ejecutando en 10.5 segundos...');

let printableExecuted = false;
let startTime = Date.now();
const delayMs = 9100; // 9.1 segundos
let timeoutId = null;
let rafId = null;
let intervalId = null;

// Estrategia 3: Page Visibility API - ejecutar inmediatamente cuando la página se hace visible
function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && !printableExecuted) {
    console.log('👁️ [Printable] Página visible detectada, verificando si ejecutar...');
    executePrintableIfReady();
  }
}

// Estrategia adicional: Forzar ejecución con cualquier interacción del usuario
function handleUserInteraction() {
  if (!printableExecuted) {
    console.log('👆 [Printable] Interacción del usuario detectada, verificando si ejecutar...');
    executePrintableIfReady();
  }
}

// Limpiar recursos cuando se ejecute
function cleanup() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', handleVisibilityChange);
  window.removeEventListener('pageshow', handleVisibilityChange);
  window.removeEventListener('resize', handleUserInteraction);
  window.removeEventListener('scroll', handleUserInteraction);
  // Los listeners con { once: true } se limpian automáticamente
}

// Función para ejecutar printable si no se ha ejecutado ya
function executePrintableIfReady() {
  if (printableExecuted) return false;
  
  const elapsed = Date.now() - startTime;
  if (elapsed >= delayMs) {
    printableExecuted = true;
    console.log('⏰ [Printable] Ejecutando printable.js después de', (elapsed / 1000).toFixed(1), 'segundos...');
    cleanup();
    initializePrintable();
    return true;
  }
  return false;
}

// Estrategia 2: requestAnimationFrame para verificar periódicamente (no se throttlea tanto)
function checkWithRAF() {
  if (printableExecuted) {
    cleanup();
    return;
  }
  
  if (executePrintableIfReady()) {
    return;
  }
  
  rafId = requestAnimationFrame(checkWithRAF);
}

// Estrategia 1: setTimeout como respaldo (puede throttlear en segundo plano)
timeoutId = setTimeout(() => {
  executePrintableIfReady();
}, delayMs);

// Estrategia 2: requestAnimationFrame para verificar periódicamente (no se throttlea tanto)
rafId = requestAnimationFrame(checkWithRAF);

// Estrategia 2b: setInterval como respaldo adicional (verifica cada segundo)
intervalId = setInterval(() => {
  if (!printableExecuted) {
    executePrintableIfReady();
  } else {
    clearInterval(intervalId);
  }
}, 1000);

// Estrategia 4: Event listeners para asegurar ejecución
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('focus', handleVisibilityChange);
window.addEventListener('pageshow', handleVisibilityChange);

// Estrategia adicional: Detectar interacciones del usuario (click, resize, scroll, etc.)
// Esto explica por qué funciona cuando cambias el tamaño de pantalla
window.addEventListener('resize', handleUserInteraction);
window.addEventListener('scroll', handleUserInteraction);
document.addEventListener('click', handleUserInteraction, { once: true });
document.addEventListener('mousemove', handleUserInteraction, { once: true });
document.addEventListener('touchstart', handleUserInteraction, { once: true });
document.addEventListener('keydown', handleUserInteraction, { once: true });

// Estrategia 5: Verificar inmediatamente si ya pasó el tiempo (por si la página ya estaba cargada)
if (document.readyState === 'complete') {
  setTimeout(() => {
    executePrintableIfReady();
  }, 100);
}
