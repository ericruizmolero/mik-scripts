(function () {
  const params = new URLSearchParams(window.location.search);
    
    // Función para extraer valor numérico de un parámetro
    function extraerValor(parametro) {
      if (!parametro) return 0;
      return Number(parametro.split('-').pop()) || 0;
    }
  
  // Función para calcular media ambiental (usando el mismo método que grafica-ambiental.js)
  function calcularMediaAmbiental() {
    // 1. Impacto Climático - p17, p18, p21.3, p22.5, p22.1, p22.2
    const p17 = extraerValor(params.get('Pregunta-17'));
    const p18 = extraerValor(params.get('Pregunta-18'));
    // p21_3: si es 14.29 (o cercano), normalizar a 100 para efectos de cálculo
    const p21_3_raw = extraerValor(params.get('Pregunta-21.3'));
    const p21_3 = Math.abs(p21_3_raw - 14.29) < 0.01 ? 100 : p21_3_raw;
    const p22_5 = extraerValor(params.get('Pregunta-22.5'));
    const p22_1 = extraerValor(params.get('Pregunta-22.1'));
    const p22_2 = extraerValor(params.get('Pregunta-22.2'));
    const impactoClimatico = (p17 + p18 + p21_3 + p22_5 + p22_1 + p22_2) / 6;
    
    // 2. Gestión Sostenible - p23, p19, p22.3, p22.4, p22.6
    // p23: suma de checkboxes (p23.1, p23.2, p23.3, p23.4, p23.5, p23.6)
      const p23_1 = params.get('p23.1-16.66666667') ? 16.66666667 : 0;
      const p23_2 = params.get('p23.2-16.66666667') ? 16.66666667 : 0;
      const p23_3 = params.get('p23.3-16.66666667') ? 16.66666667 : 0;
      const p23_4 = params.get('p23.4-16.66666667') ? 16.66666667 : 0;
      const p23_5 = params.get('p23.5-16.66666667') ? 16.66666667 : 0;
      const p23_6 = params.get('p23.6-16.66666667') ? 16.66666667 : 0;
    const p23 = p23_1 + p23_2 + p23_3 + p23_4 + p23_5 + p23_6;
    
    const p19 = extraerValor(params.get('Pregunta-19'));
    const p22_3 = extraerValor(params.get('Pregunta-22.3'));
    const p22_4 = extraerValor(params.get('Pregunta-22.4'));
    const p22_6 = extraerValor(params.get('Pregunta-22.6'));
    const gestionSostenible = (p23 + p19 + p22_3 + p22_4 + p22_6) / 5;
    
    // 3. Biodiversidad y Ecosistemas - p22.7, p21.4, p20
    const p22_7 = extraerValor(params.get('Pregunta-22.7'));
    // p21_4: si es 14.29 (o cercano), normalizar a 100 para efectos de cálculo
    const p21_4_raw = extraerValor(params.get('Pregunta-21.4'));
    const p21_4 = Math.abs(p21_4_raw - 14.29) < 0.01 ? 100 : p21_4_raw;
    const p20 = extraerValor(params.get('Pregunta-20'));
    const biodiversidad = (p22_7 + p21_4 + p20) / 3;
    
    // 4. Gestión Ambiental - p24, p21 (media de p21.1, p21.2)
      const p24 = extraerValor(params.get('Pregunta-24'));
      
    // p21: media de sub-preguntas (Pregunta-21.1, Pregunta-21.2)
      // p21a y p21b: si son 14.29 (o cercano), normalizar a 100 para efectos de cálculo
      const p21a_raw = extraerValor(params.get('Pregunta-21.1'));
      const p21a = Math.abs(p21a_raw - 14.29) < 0.01 ? 100 : p21a_raw;
      const p21b_raw = extraerValor(params.get('Pregunta-21.2'));
      const p21b = Math.abs(p21b_raw - 14.29) < 0.01 ? 100 : p21b_raw;
    const p21 = (p21a + p21b) / 2;
    
    const gestionAmbiental = (p24 + p21) / 2;
    
    // Calcular media de las 4 temáticas
    return (impactoClimatico + gestionSostenible + biodiversidad + gestionAmbiental) / 4;
  }

  // Función para calcular media gobernanza (usando el mismo método que grafica-gobernanza.js)
  function calcularMediaGobernanza() {
    // 1. Estrategia empresarial - p1, p2, p3
      const p1 = extraerValor(params.get('Pregunta-1'));
      const p2 = extraerValor(params.get('Pregunta-2'));
      
      // p3: suma de checkboxes (p3.1, p3.2, p3.3, p3.4, p3.5, p3.6, p3.7, p3.8)
      const p3_1 = params.get('p3.1-12.5') ? 12.5 : 0;
      const p3_2 = params.get('p3.2-12.5') ? 12.5 : 0;
      const p3_3 = params.get('p3.3-12.5') ? 12.5 : 0;
      const p3_4 = params.get('p3.4-12.5') ? 12.5 : 0;
      const p3_5 = params.get('p3.5-12.5') ? 12.5 : 0;
      const p3_6 = params.get('p3.6-12.5') ? 12.5 : 0;
      const p3_7 = params.get('p3.7-12.5') ? 12.5 : 0;
      const p3_8 = params.get('p3.8-12.5') ? 12.5 : 0;
      const p3 = p3_1 + p3_2 + p3_3 + p3_4 + p3_5 + p3_6 + p3_7 + p3_8;
    const estrategiaEmpresarial = (p1 + p2 + p3) / 3;
    
    // 2. Eco-financiero y digitalización - p25, p26, p27, p28
      // p25: suma de sub-preguntas (Pregunta-25.1 a Pregunta-25.7) - cada respuesta puede ser 14.29 o 0
      const p25a = extraerValor(params.get('Pregunta-25.1'));
      const p25b = extraerValor(params.get('Pregunta-25.2'));
      const p25c = extraerValor(params.get('Pregunta-25.3'));
      const p25d = extraerValor(params.get('Pregunta-25.4'));
      const p25e = extraerValor(params.get('Pregunta-25.5'));
      const p25f = extraerValor(params.get('Pregunta-25.6'));
      const p25g = extraerValor(params.get('Pregunta-25.7'));
      const p25 = p25a + p25b + p25c + p25d + p25e + p25f + p25g;
      
    // p26: suma de checkboxes (p26.1, p26.2, p26.3)
      const p26_1 = params.get('p26.1-33.33') ? 33.33 : 0;
      const p26_2 = params.get('p26.2-33.33') ? 33.33 : 0;
      const p26_3 = params.get('p26.3-33.33') ? 33.33 : 0;
    const p26 = p26_1 + p26_2 + p26_3;
      
      const p27 = extraerValor(params.get('Pregunta-27'));
      const p28 = extraerValor(params.get('Pregunta-28'));
    const ecoFinanciero = (p25 + p26 + p27 + p28) / 4;
      
    // 3. Proveedores - p14, p15, p16
      // p14: suma de sub-preguntas (Pregunta-14.1 a Pregunta-14.7) - cada respuesta puede ser 14.29 o 0
      const p14a = extraerValor(params.get('Pregunta-14.1'));
      const p14b = extraerValor(params.get('Pregunta-14.2'));
      const p14c = extraerValor(params.get('Pregunta-14.3'));
      const p14d = extraerValor(params.get('Pregunta-14.4'));
      const p14e = extraerValor(params.get('Pregunta-14.5'));
      const p14f = extraerValor(params.get('Pregunta-14.6'));
      const p14g = extraerValor(params.get('Pregunta-14.7'));
      const p14 = p14a + p14b + p14c + p14d + p14e + p14f + p14g;
      
      const p15 = extraerValor(params.get('Pregunta-15'));
      const p16 = extraerValor(params.get('Pregunta-16'));
    const proveedores = (p14 + p15 + p16) / 3;
      
    // 4. Código ético y transparencia - p4, p5, p6, p7
      const p4 = extraerValor(params.get('Pregunta-4'));
      
      // p5: suma de checkboxes (p5.1, p5.2, p5.3, p5.4, p5.5, p5.6)
      const p5_1 = params.get('p5.1-16.66666667') ? 16.67 : 0;
      const p5_2 = params.get('p5.2-16.66666667') ? 16.67 : 0;
      const p5_3 = params.get('p5.3-16.66666667') ? 16.67 : 0;
      const p5_4 = params.get('p5.4-16.66666667') ? 16.67 : 0;
      const p5_5 = params.get('p5.5-16.66666667') ? 16.67 : 0;
      const p5_6 = params.get('p5.6-16.66666667') ? 16.67 : 0;
      const p5 = p5_1 + p5_2 + p5_3 + p5_4 + p5_5 + p5_6;
      
      const p6 = extraerValor(params.get('Pregunta-6'));
      const p7 = extraerValor(params.get('Pregunta-7'));
    const codigoEtico = (p4 + p5 + p6 + p7) / 4;
    
    // Calcular media de las 4 temáticas
    return (estrategiaEmpresarial + ecoFinanciero + proveedores + codigoEtico) / 4;
  }

  // Función para calcular media social (usando el mismo método que grafica-social.js)
  function calcularMediaSocial() {
    // 1. Interno - p8, p9, p10, p11, p12
      const p8 = extraerValor(params.get('Pregunta-8'));
      
      // p9: suma de sub-preguntas (Pregunta-9.1 a Pregunta-9.8) - cada respuesta puede ser 12.5 o 0
      const p9a = extraerValor(params.get('Pregunta-9.1'));
      const p9b = extraerValor(params.get('Pregunta-9.2'));
      const p9c = extraerValor(params.get('Pregunta-9.3'));
      const p9d = extraerValor(params.get('Pregunta-9.4'));
      const p9e = extraerValor(params.get('Pregunta-9.5'));
      const p9f = extraerValor(params.get('Pregunta-9.6'));
      const p9g = extraerValor(params.get('Pregunta-9.7'));
      const p9h = extraerValor(params.get('Pregunta-9.8'));
      const p9 = p9a + p9b + p9c + p9d + p9e + p9f + p9g + p9h;
      
      const p10 = extraerValor(params.get('Pregunta-10'));
      
    // p11: suma de checkboxes (p11.1, p11.2, p11.3, p11.4)
      const p11_1 = params.get('p11.1-25') ? 25 : 0;
      const p11_2 = params.get('p11.2-25') ? 25 : 0;
      const p11_3 = params.get('p11.3-25') ? 25 : 0;
      const p11_4 = params.get('p11.4-25') ? 25 : 0;
    const p11 = p11_1 + p11_2 + p11_3 + p11_4;
      
      // p12: suma de sub-preguntas (Pregunta-12.1 a Pregunta-12.8) - cada respuesta puede ser 12.5 o 0
      const p12a = extraerValor(params.get('Pregunta-12.1'));
      const p12b = extraerValor(params.get('Pregunta-12.2'));
      const p12c = extraerValor(params.get('Pregunta-12.3'));
      const p12d = extraerValor(params.get('Pregunta-12.4'));
      const p12e = extraerValor(params.get('Pregunta-12.5'));
      const p12f = extraerValor(params.get('Pregunta-12.6'));
      const p12g = extraerValor(params.get('Pregunta-12.7'));
      const p12h = extraerValor(params.get('Pregunta-12.8'));
      const p12 = p12a + p12b + p12c + p12d + p12e + p12f + p12g + p12h;
      
    const interno = (p8 + p9 + p10 + p11 + p12) / 5;
      
    // 2. Externo - p13
    // p13: suma de checkboxes (p13.1, p13.2, p13.3, p13.4, p13.5, p13.6, p13.7)
      const p13_1 = params.get('p13.1-14.29') ? 14.29 : 0;
      const p13_2 = params.get('p13.2-14.29') ? 14.29 : 0;
      const p13_3 = params.get('p13.3-14.29') ? 14.29 : 0;
      const p13_4 = params.get('p13.4-14.29') ? 14.29 : 0;
      const p13_5 = params.get('p13.5-14.29') ? 14.29 : 0;
      const p13_6 = params.get('p13.6-14.29') ? 14.29 : 0;
    const p13_7 = params.get('p13.7-14.29') ? 14.29 : 0;
    const p13 = p13_1 + p13_2 + p13_3 + p13_4 + p13_5 + p13_6 + p13_7;
    
    const externo = p13;
    
    // Calcular media de las 2 temáticas
    return (interno + externo) / 2;
  }

  // Calcular y mostrar media ambiental
  const mediaAmbiental = calcularMediaAmbiental();
  const elAmbiental = document.getElementById('ambiental-index-total');
  if (elAmbiental) {
    elAmbiental.textContent = Math.round(mediaAmbiental); // Redondear a número entero
  }

  // Aplicar el porcentaje como altura al elemento con clase result_char is-ambiental-you
  const mediaAmbientalRedondeada = Math.round(mediaAmbiental);
  const elementoAmbiental = document.querySelector('.result_char.is-ambiental-you');
  if (elementoAmbiental) {
    elementoAmbiental.style.setProperty('height', mediaAmbientalRedondeada + '%', 'important')
  }

  // Calcular y mostrar media social
  const mediaSocial = calcularMediaSocial();
  const elSocial = document.getElementById('social-index-total');
  if (elSocial) {
    elSocial.textContent = Math.round(mediaSocial); // Redondear a número entero
  }

  // Aplicar el porcentaje como altura al elemento con clase result_char is-social-you
  const mediaSocialRedondeada = Math.round(mediaSocial);
  const elementoSocial = document.querySelector('.result_char.is-social-you');
  if (elementoSocial) {
    elementoSocial.style.setProperty('height', mediaSocialRedondeada + '%', 'important')
  }

  // Calcular y mostrar media gobernanza
  const mediaGobernanza = calcularMediaGobernanza();
  const elGobernanza = document.getElementById('gobernanza-index-total');
  if (elGobernanza) {
    elGobernanza.textContent = Math.round(mediaGobernanza); // Redondear a número entero
  }

  // Aplicar el porcentaje como altura al elemento con clase result_char is-gobernanza-you
  const mediaGobernanzaRedondeada = Math.round(mediaGobernanza);
  const elementoGobernanza = document.querySelector('.result_char.is-gobernanza-you');
  if (elementoGobernanza) {
    elementoGobernanza.style.setProperty('height', mediaGobernanzaRedondeada + '%', 'important')
  }

  // Calcular y mostrar GSB Index (media de los tres pilares)
  const gsbIndex = (mediaAmbiental + mediaSocial + mediaGobernanza) / 3;
  const elGsb = document.getElementById('gsb-index-total');
  if (elGsb) {
    elGsb.textContent = Math.round(gsbIndex); // Redondear a número entero
  }

  // Aplicar el porcentaje como altura al elemento con clase result_char is-gsb-you
  const gsbIndexRedondeado = Math.round(gsbIndex);
  const elementoGsb = document.querySelector('.result_char.is-gsb-you');
  if (elementoGsb) {
    elementoGsb.style.setProperty('height', gsbIndexRedondeado + '%', 'important')
  }

  // Medias sectoriales (valores por defecto - placeholders)
  let mediaSectorialAmbiental = 0; // Valor placeholder - datos no disponibles
  let mediaSectorialSocial = 0;   // Valor placeholder - datos no disponibles
  let mediaSectorialGobernanza = 0; // Valor placeholder - datos no disponibles
  let mediaSectorialESG = 0;      // Valor placeholder - datos no disponibles

  // Función para cargar medias sectoriales desde sheets.js
  async function loadSectorialAverages() {
    try {
      console.log('📊 [Main] Cargando medias sectoriales desde sheets.js...');
      
      if (window.gsbSheets && window.gsbSheets.getSectorialAverages) {
        const sector = params.get('Sector');
        const tamano = params.get('Tamaño-de-tu-empresa') || params.get('Tama-o-de-tu-empresa');
        
        if (sector && tamano) {
          console.log(`📊 [Main] Obteniendo medias para sector: ${sector}, tamaño: ${tamano}`);
          
          const averages = await window.gsbSheets.getSectorialAverages(sector, tamano);
          
          if (averages && averages.media_ambiental !== undefined && averages.media_social !== undefined && 
              averages.media_gobernanza !== undefined && averages.gsb_index_total !== undefined) {
            
            // Actualizar las medias sectoriales
            mediaSectorialAmbiental = averages.media_ambiental;
            mediaSectorialSocial = averages.media_social;
            mediaSectorialGobernanza = averages.media_gobernanza;
            mediaSectorialESG = averages.gsb_index_total;
            
            console.log('✅ [Main] Medias sectoriales cargadas:', {
              ambiental: mediaSectorialAmbiental,
              social: mediaSectorialSocial,
              gobernanza: mediaSectorialGobernanza,
              gsb: mediaSectorialESG
            });
            
            // Actualizar las gráficas con las nuevas medias
            updateGraphicsWithNewAverages();
          } else {
            console.log('⚠️ [Main] No se encontraron medias sectoriales específicas, usando valores por defecto');
            updateGraphicsWithNewAverages(); // Usar valores por defecto
          }
        } else {
          console.log('⚠️ [Main] No se encontraron datos de sector/tamaño, usando valores por defecto');
          updateGraphicsWithNewAverages(); // Usar valores por defecto
        }
      } else {
        console.log('⚠️ [Main] sheets.js no está disponible, usando valores por defecto');
        updateGraphicsWithNewAverages(); // Usar valores por defecto
      }
    } catch (error) {
      console.error('❌ [Main] Error cargando medias sectoriales:', error);
      console.log('📊 [Main] Usando valores por defecto');
      updateGraphicsWithNewAverages(); // Usar valores por defecto
    }
  }
  
  // Función para actualizar las gráficas con las nuevas medias (copiado de grafica-ambiental.js)
  function updateGraphicsWithNewAverages() {
    console.log('🔄 [Main] Actualizando gráficas con nuevas medias sectoriales...');
    
    // Recalcular las métricas
    const ambientalActual = calcularMediaAmbiental();
    const socialActual = calcularMediaSocial();
    const gobernanzaActual = calcularMediaGobernanza();
    const gsbActual = (ambientalActual + socialActual + gobernanzaActual) / 3;
    
    // Actualizar elementos de ambiental
    mostrarResultadoMain(
      ambientalActual,
      mediaSectorialAmbiental,
      'ambiental-index',
      '.result_char.is-ambiental-you',
      '.result_char.is-ambiental-sector',
      'ambiental-percent',
      '.result_icons.is-ambiental'
    );
    
    // Actualizar elementos de social
    mostrarResultadoMain(
      socialActual,
      mediaSectorialSocial,
      'social-index',
      '.result_char.is-social-you',
      '.result_char.is-social-sector',
      'social-percent',
      '.result_icons.is-social'
    );
    
    // Actualizar elementos de gobernanza
    mostrarResultadoMain(
      gobernanzaActual,
      mediaSectorialGobernanza,
      'gobernanza-index',
      '.result_char.is-gobernanza-you',
      '.result_char.is-gobernanza-sector',
      'gobernanza-percent',
      '.result_icons.is-gobernanza'
    );
    
    // Actualizar elementos de GSB
    mostrarResultadoMain(
      gsbActual,
      mediaSectorialESG,
      'gsb-index',
      '.result_char.is-gsb-you',
      '.result_char.is-gsb-sector',
      'gsbindex-percent',
      '.result_icons.is-gsb'
    );

    console.log('✅ [Main] Gráficas actualizadas con nuevas medias');
  }

  // Función para mostrar resultado principal (copiado de mostrarResultadoTematica de grafica-ambiental.js)
  function mostrarResultadoMain(valor, valorSectorial, idIndex, claseYou, claseSector, idPercent, claseIcons) {
    // Mostrar valor en el índice
    const elIndex = document.getElementById(idIndex);
    if (elIndex) {
      elIndex.textContent = Math.round(valor);
    }

    // Aplicar altura al elemento "you"
    const elementoYou = document.querySelector(claseYou);
    if (elementoYou) {
      elementoYou.style.setProperty('height', Math.round(valor) + '%', 'important');
    }

    // Aplicar altura al elemento "sector"
    const elementoSector = document.querySelector(claseSector);
    if (elementoSector) {
      elementoSector.style.setProperty('height', Math.round(valorSectorial) + '%', 'important');
    }

    // Calcular y mostrar diferencia (copiado exactamente de grafica-ambiental.js)
    const diferencia = valor - valorSectorial;
    const diferenciaRedondeada = Math.round(diferencia * 10) / 10;
    
    console.log(`📊 [Main] ${idIndex}: valor=${valor}, sectorial=${valorSectorial}, diferencia=${diferenciaRedondeada}`);
    
    const elPercent = document.getElementById(idPercent);
    if (elPercent) {
      if (diferenciaRedondeada >= 0) {
        elPercent.textContent = '+' + diferenciaRedondeada + '%';
      } else {
        elPercent.textContent = diferenciaRedondeada + '%';
      }
    }

    // Aplicar clases según si es positivo o negativo
    const elementoIcons = document.querySelector(claseIcons);
    if (elementoIcons) {
      const iconGreen = elementoIcons.querySelector('.result_icon-green');
      const iconRed = elementoIcons.querySelector('.result_icon-red');
      
      console.log(`🔍 [Main] ${claseIcons}: diferencia=${diferenciaRedondeada}, verde=${!!iconGreen}, rojo=${!!iconRed}`);
      
      if (diferenciaRedondeada >= 0) {
        // Positivo: activar verde, desactivar rojo
        console.log(`✅ [Main] ${claseIcons}: Activando verde (positivo)`);
        if (iconGreen) {
          iconGreen.classList.remove('is-inactive');
          iconGreen.classList.add('is-active');
        }
        if (iconRed) {
          iconRed.classList.remove('is-active');
          iconRed.classList.add('is-inactive');
        }
      } else {
        // Negativo: activar rojo, desactivar verde
        console.log(`❌ [Main] ${claseIcons}: Activando rojo (negativo)`);
        if (iconRed) {
          iconRed.classList.remove('is-inactive');
          iconRed.classList.add('is-active');
        }
        if (iconGreen) {
          iconGreen.classList.remove('is-active');
          iconGreen.classList.add('is-inactive');
        }
      }
    } else {
      console.warn(`⚠️ [Main] No se encontró elemento: ${claseIcons}`);
    }
  }
  
  // Escuchar eventos de sheets.js
  window.addEventListener('gsbDataSent', function(event) {
    console.log('📡 [Main] Evento gsbDataSent recibido desde sheets.js');
    if (event.detail && event.detail.success) {
      console.log('🔄 [Main] Sincronizando con datos de sheets.js...');
      loadSectorialAverages();
    }
  });
  
  window.addEventListener('gsbDataSync', function(event) {
    console.log('📡 [Main] Evento gsbDataSync recibido desde sheets.js');
    loadSectorialAverages();
  });
  
  // Establecer estados iniciales
  const cueWaiting = document.querySelector('.cue_waiting');
  const cueResults = document.querySelector('.cue_results');
  
  if (cueWaiting) {
    cueWaiting.style.display = 'block';
    console.log('🔄 [Main] Mostrando loading inicial');
  }
  
  if (cueResults) {
    cueResults.style.display = 'none';
    console.log('🔄 [Main] Ocultando resultados iniciales');
  }

  // Sistema simple: esperar 6 segundos y mostrar resultados
  setTimeout(() => {
    console.log('🎉 [Main] Mostrando resultados después de 6 segundos...');
    
    // Ocultar loading
    if (cueWaiting) {
      cueWaiting.style.display = 'none';
    }
    
    // Mostrar resultados
    if (cueResults) {
      cueResults.style.display = 'block';
    }
  }, 9000);

  // Cargar medias sectoriales inicialmente
  loadSectorialAverages();

  // Establecer porcentajes iniciales (con valores por defecto = 0)
  const elAmbientalPercent = document.getElementById('ambiental-percent');
  if (elAmbientalPercent) {
    elAmbientalPercent.textContent = '+' + Math.round(mediaAmbiental) + '%';
  }
  
  const elSocialPercent = document.getElementById('social-percent');
  if (elSocialPercent) {
    elSocialPercent.textContent = '+' + Math.round(mediaSocial) + '%';
  }
  
  const elGobernanzaPercent = document.getElementById('gobernanza-percent');
  if (elGobernanzaPercent) {
    elGobernanzaPercent.textContent = '+' + Math.round(mediaGobernanza) + '%';
  }
  
  const elGsbPercent = document.getElementById('gsbindex-percent');
  if (elGsbPercent) {
    elGsbPercent.textContent = '+' + Math.round(gsbIndex) + '%';
  }

  // Mostrar información de la empresa
  const email = params.get('Email');
  const empresa = params.get('Compañia');
      const sector = params.get('Sector');
  const tamaño = params.get('Tamaño-de-tu-empresa');
 

  const elEmail = document.getElementById('correo');
  if (elEmail && email) {
    elEmail.textContent = decodeURIComponent(email);
  }
  
  const elEmpresa = document.getElementById('empresa');
  if (elEmpresa && empresa) {
    elEmpresa.textContent = decodeURIComponent(empresa);
  }

  const elSector = document.getElementById('sector');
  if (elSector && sector) {
    elSector.textContent = decodeURIComponent(sector);
  }

  const elTamaño = document.getElementById('tamano');
  if (elTamaño && tamaño) {
    elTamaño.textContent = decodeURIComponent(tamaño);
    }
  
    // Limpia la URL (sin recargar la página) - COMENTADO PARA PRUEBAS
    // if (window.history.replaceState) {
    //   window.history.replaceState({}, document.title, '/resultado');
    // }
  })();
  
