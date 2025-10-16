

/**
 * Genera un PDF A4 desde #printable con escala inteligente y lo envía por email si hay ?email=... en la URL.
 * - Si no hay email o el envío falla, descarga el PDF localmente.
 * - El cuerpo del email es simple (solo texto con HTML básico) e incluye un enlace a la guía.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const area = document.getElementById('printable');
  if (!area) {
    console.error('No se encontró el elemento #printable.');
    return;
  }

  if (typeof html2pdf === 'undefined') {
    alert('No se cargó html2pdf.js');
    return;
  }

  // --- Parámetros desde la URL ---
  const params = new URLSearchParams(window.location.search);
  const rawEmail = params.get('Email') || params.get('email') || '';
  const nombre = decodeURIComponent(params.get('Nombre') || '').trim() || 'Usuario';
  const empresa = decodeURIComponent(params.get('Compañia') || params.get('Compania') || '').trim() || 'tu empresa';
  const to = (rawEmail || '').trim();
  const hasEmail = !!to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);

  // --- Medidas y escala para A4 ---
  const A4_WIDTH_PX = 794;
  const desiredScale = 0.57;
  const contentWidth =
    Math.ceil(area.getBoundingClientRect().width) ||
    area.scrollWidth ||
    area.offsetWidth ||
    area.clientWidth ||
    1200;
  const autoScale = Math.min(0.98, A4_WIDTH_PX / contentWidth);
  const scale = Math.min(desiredScale, autoScale);

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

  const stamp = new Date().toISOString().slice(0, 10);
  const base = hasEmail ? to.split('@')[0] : 'resultado';
  const filename = `${base}-${stamp}.pdf`;

  let wrapper;
  try {
    // --- Esperar fuentes e imágenes ---
    if (document.fonts && document.fonts.ready) {
      try { await Promise.race([document.fonts.ready, wait(1500)]); } catch {}
    }
    await waitForImages(area);
    await wait(300);

    // --- Clonar y renderizar fuera de pantalla ---
    const clone = area.cloneNode(true);
    wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'fixed',
      left: '-99999px',
      top: '0',
      width: contentWidth + 'px',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: '-1'
    });

    clone.style.width = contentWidth + 'px';
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = 'top left';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // --- Opciones de html2pdf ---
    const opts = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // --- Generar PDF desde el clon ---
    const worker = html2pdf().set(opts).from(clone).toPdf();
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
        await html2pdf().set(opts).from(clone).save();
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error enviando el email');
      }

      console.log(`✅ PDF enviado correctamente a ${to} (escala: ${scale.toFixed(2)})`);
    } else {
      console.warn('No se encontró email en la URL. Descargando el PDF localmente.');
      await html2pdf().set(opts).from(clone).save();
    }

  } catch (err) {
    console.error('❌ Error:', err);
    alert('No se pudo completar el envío automático. Se intentó generar el PDF localmente.');
  } finally {
    if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }
});
