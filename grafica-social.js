(function () {
  const params = new URLSearchParams(window.location.search);
  
  // Función para extraer valor numérico de un parámetro
  function extraerValor(parametro) {
    if (!parametro) return 0;
    return Number(parametro.split('-').pop()) || 0;
  }

  // Función para calcular media de sub-preguntas
  function calcularMediaSubPreguntas(subPreguntas) {
    const valores = subPreguntas.map(p => extraerValor(params.get(p)));
    return valores.reduce((acc, val) => acc + val, 0) / valores.length;
  }

  // 1. Interno - p8, p9, p10, p11, p12
  function calcularInterno() {
    const p8 = extraerValor(params.get('Pregunta-8'));
    
    // p9: media de sub-preguntas (Pregunta-9.1 a Pregunta-9.8)
    const p9a = extraerValor(params.get('Pregunta-9.1'));
    const p9b = extraerValor(params.get('Pregunta-9.2'));
    const p9c = extraerValor(params.get('Pregunta-9.3'));
    const p9d = extraerValor(params.get('Pregunta-9.4'));
    const p9e = extraerValor(params.get('Pregunta-9.5'));
    const p9f = extraerValor(params.get('Pregunta-9.6'));
    const p9g = extraerValor(params.get('Pregunta-9.7'));
    const p9h = extraerValor(params.get('Pregunta-9.8'));
    const p9 = (p9a + p9b + p9c + p9d + p9e + p9f + p9g + p9h) / 8;
    
    const p10 = extraerValor(params.get('Pregunta-10'));
    
    // p11: suma de checkboxes (p11.1, p11.2, p11.3, p11.4)
    const p11_1 = params.get('p11.1-25') ? 25 : 0;
    const p11_2 = params.get('p11.2-25') ? 25 : 0;
    const p11_3 = params.get('p11.3-25') ? 25 : 0;
    const p11_4 = params.get('p11.4-25') ? 25 : 0;
    const p11 = p11_1 + p11_2 + p11_3 + p11_4;
    
    // p12: media de sub-preguntas (Pregunta-12.1 a Pregunta-12.8)
    const p12a = extraerValor(params.get('Pregunta-12.1'));
    const p12b = extraerValor(params.get('Pregunta-12.2'));
    const p12c = extraerValor(params.get('Pregunta-12.3'));
    const p12d = extraerValor(params.get('Pregunta-12.4'));
    const p12e = extraerValor(params.get('Pregunta-12.5'));
    const p12f = extraerValor(params.get('Pregunta-12.6'));
    const p12g = extraerValor(params.get('Pregunta-12.7'));
    const p12h = extraerValor(params.get('Pregunta-12.8'));
    const p12 = (p12a + p12b + p12c + p12d + p12e + p12f + p12g + p12h) / 8;
    
    return (p8 + p9 + p10 + p11 + p12) / 5;
  }

  // 2. Externo - p13
  function calcularExterno() {
    // p13: suma de checkboxes (p13.1, p13.2, p13.3, p13.4, p13.5, p13.6, p13.7)
    const p13_1 = params.get('p13.1-14.29') ? 14.29 : 0;
    const p13_2 = params.get('p13.2-14.29') ? 14.29 : 0;
    const p13_3 = params.get('p13.3-14.29') ? 14.29 : 0;
    const p13_4 = params.get('p13.4-14.29') ? 14.29 : 0;
    const p13_5 = params.get('p13.5-14.29') ? 14.29 : 0;
    const p13_6 = params.get('p13.6-14.29') ? 14.29 : 0;
    const p13_7 = params.get('p13.7-14.29') ? 14.29 : 0;
    const p13 = p13_1 + p13_2 + p13_3 + p13_4 + p13_5 + p13_6 + p13_7;
    
    return p13;
  }

  // Calcular medias de temáticas sociales
  const interno = calcularInterno();
  const externo = calcularExterno();

  // Medias sectoriales por temática (valores por defecto - placeholders)
  let mediaSectorialInterno = 0; // Valor placeholder - datos no disponibles
  let mediaSectorialExterno = 0; // Valor placeholder - datos no disponibles

  // Función para cargar medias sectoriales desde sheets.js
  async function loadSectorialAverages() {
    try {
      console.log('📊 [Social] Cargando medias sectoriales desde sheets.js...');
      
      if (window.gsbSheets && window.gsbSheets.getSectorialAverages) {
        const sector = params.get('Sector');
        const tamano = params.get('Tamaño-de-tu-empresa') || params.get('Tama-o-de-tu-empresa');
        
        if (sector && tamano) {
          console.log(`📊 [Social] Obteniendo medias para sector: ${sector}, tamaño: ${tamano}`);
          
          const averages = await window.gsbSheets.getSectorialAverages(sector, tamano);
          
          if (averages && averages.interno !== undefined && averages.externo !== undefined) {
            // Actualizar las medias sectoriales
            mediaSectorialInterno = averages.interno;
            mediaSectorialExterno = averages.externo;
            
            console.log('✅ [Social] Medias sectoriales cargadas:', {
              interno: mediaSectorialInterno,
              externo: mediaSectorialExterno
            });
            
            // Actualizar las gráficas con las nuevas medias
            updateGraphicsWithNewAverages();
          } else {
            console.log('⚠️ [Social] No se encontraron medias sectoriales específicas, usando valores por defecto');
            updateGraphicsWithNewAverages(); // Usar valores por defecto
          }
        } else {
          console.log('⚠️ [Social] No se encontraron datos de sector/tamaño, usando valores por defecto');
          updateGraphicsWithNewAverages(); // Usar valores por defecto
        }
      } else {
        console.log('⚠️ [Social] sheets.js no está disponible, usando valores por defecto');
        updateGraphicsWithNewAverages(); // Usar valores por defecto
      }
    } catch (error) {
      console.error('❌ [Social] Error cargando medias sectoriales:', error);
      console.log('📊 [Social] Usando valores por defecto');
      updateGraphicsWithNewAverages(); // Usar valores por defecto
    }
  }
  
  // Función para actualizar las gráficas con las nuevas medias
  function updateGraphicsWithNewAverages() {
    console.log('🔄 [Social] Actualizando gráficas con nuevas medias sectoriales...');
    
    // Recalcular las métricas
    const interno = calcularInterno();
    const externo = calcularExterno();
    
    // Actualizar elementos de interno
    mostrarResultadoTematica(
      1,
      interno,
      mediaSectorialInterno,
      'social-tematica-index-1',
      '.result_char.is-social-tematica-you-1',
      '.result_char.is-social-tematica-sector-1',
      'social-tematica-percent-1',
      '.result_icons.is-interno'
    );
    
    // Actualizar elementos de externo
    mostrarResultadoTematica(
      2,
      externo,
      mediaSectorialExterno,
      'social-tematica-index-2',
      '.result_char.is-social-tematica-you-2',
      '.result_char.is-social-tematica-sector-2',
      'social-tematica-percent-2',
      '.result_icons.is-externo'
    );
    
    console.log('✅ [Social] Gráficas actualizadas con nuevas medias');
  }
  
  // Escuchar eventos de sheets.js
  window.addEventListener('gsbDataSent', function(event) {
    console.log('📡 [Social] Evento gsbDataSent recibido desde sheets.js');
    if (event.detail && event.detail.success) {
      console.log('🔄 [Social] Sincronizando con datos de sheets.js...');
      loadSectorialAverages();
    }
  });
  
  window.addEventListener('gsbDataSync', function(event) {
    console.log('📡 [Social] Evento gsbDataSync recibido desde sheets.js');
    loadSectorialAverages();
  });
  
  // Cargar medias sectoriales inicialmente
  loadSectorialAverages();

  // Función para mostrar resultados y aplicar estilos
  function mostrarResultadoTematica(numero, valor, valorSectorial, idIndex, claseYou, claseSector, idPercent, claseIcons) {
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

    // Calcular y mostrar diferencia
    const diferencia = valor - valorSectorial;
    const diferenciaRedondeada = Math.round(diferencia * 10) / 10;
    
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
      
      if (diferenciaRedondeada >= 0) {
        // Positivo: activar verde, desactivar rojo
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
        if (iconRed) {
          iconRed.classList.remove('is-inactive');
          iconRed.classList.add('is-active');
        }
        if (iconGreen) {
          iconGreen.classList.remove('is-active');
          iconGreen.classList.add('is-inactive');
        }
      }
    }
  }

  // Las llamadas a mostrarResultadoTematica ahora se manejan dinámicamente en updateGraphicsWithNewAverages()

})();
