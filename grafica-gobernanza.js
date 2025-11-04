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

  // 1. Estrategia empresarial - p1, p2, p3
  function calcularEstrategiaEmpresarial() {
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
    
    return (p1 + p2 + p3) / 3;
  }

  // 2. Eco-financiero y digitalización - p25, p26, p27, p28
  function calcularEcoFinanciero() {
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
    
    return (p25 + p26 + p27 + p28) / 4;
  }

  // 3. Proveedores - p14, p15, p16
  function calcularProveedores() {
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
    
    return (p14 + p15 + p16) / 3;
  }

  // 4. Código ético y transparencia - p4, p5, p6, p7
  function calcularCodigoEtico() {
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
    
    return (p4 + p5 + p6 + p7) / 4;
  }

  // Calcular medias de temáticas de gobernanza
  const estrategiaEmpresarial = calcularEstrategiaEmpresarial();
  const ecoFinanciero = calcularEcoFinanciero();
  const proveedores = calcularProveedores();
  const codigoEtico = calcularCodigoEtico();

  // Medias sectoriales por temática (valores por defecto - placeholders)
  let mediaSectorialEstrategiaEmpresarial = 0; // Valor placeholder - datos no disponibles
  let mediaSectorialEcoFinanciero = 0;         // Valor placeholder - datos no disponibles
  let mediaSectorialProveedores = 0;          // Valor placeholder - datos no disponibles
  let mediaSectorialCodigoEtico = 0;          // Valor placeholder - datos no disponibles

  // Función para cargar medias sectoriales desde sheets.js
  async function loadSectorialAverages() {
    try {
      console.log('📊 [Gobernanza] Cargando medias sectoriales desde sheets.js...');
      
      if (window.gsbSheets && window.gsbSheets.getSectorialAverages) {
        const sector = params.get('Sector');
        const tamano = params.get('Tamaño-de-tu-empresa') || params.get('Tama-o-de-tu-empresa');
        
        if (sector && tamano) {
          console.log(`📊 [Gobernanza] Obteniendo medias para sector: ${sector}, tamaño: ${tamano}`);
          
          const averages = await window.gsbSheets.getSectorialAverages(sector, tamano);
          
          if (averages && averages.estrategia_empresarial !== undefined && averages.eco_financiero !== undefined &&
              averages.proveedores !== undefined && averages.codigo_etico !== undefined) {
            // Actualizar las medias sectoriales
            mediaSectorialEstrategiaEmpresarial = averages.estrategia_empresarial;
            mediaSectorialEcoFinanciero = averages.eco_financiero;
            mediaSectorialProveedores = averages.proveedores;
            mediaSectorialCodigoEtico = averages.codigo_etico;
            
            console.log('✅ [Gobernanza] Medias sectoriales cargadas:', {
              estrategia_empresarial: mediaSectorialEstrategiaEmpresarial,
              eco_financiero: mediaSectorialEcoFinanciero,
              proveedores: mediaSectorialProveedores,
              codigo_etico: mediaSectorialCodigoEtico
            });
            
            // Actualizar las gráficas con las nuevas medias
            updateGraphicsWithNewAverages();
          } else {
            console.log('⚠️ [Gobernanza] No se encontraron medias sectoriales específicas, usando valores por defecto');
            updateGraphicsWithNewAverages(); // Usar valores por defecto
          }
        } else {
          console.log('⚠️ [Gobernanza] No se encontraron datos de sector/tamaño, usando valores por defecto');
          updateGraphicsWithNewAverages(); // Usar valores por defecto
        }
      } else {
        console.log('⚠️ [Gobernanza] sheets.js no está disponible, usando valores por defecto');
        updateGraphicsWithNewAverages(); // Usar valores por defecto
      }
    } catch (error) {
      console.error('❌ [Gobernanza] Error cargando medias sectoriales:', error);
      console.log('📊 [Gobernanza] Usando valores por defecto');
      updateGraphicsWithNewAverages(); // Usar valores por defecto
    }
  }
  
  // Función para actualizar las gráficas con las nuevas medias
  function updateGraphicsWithNewAverages() {
    console.log('🔄 [Gobernanza] Actualizando gráficas con nuevas medias sectoriales...');
    
    // Recalcular las métricas
    const estrategiaEmpresarial = calcularEstrategiaEmpresarial();
    const ecoFinanciero = calcularEcoFinanciero();
    const proveedores = calcularProveedores();
    const codigoEtico = calcularCodigoEtico();
    
    // Actualizar elementos de estrategia empresarial
    mostrarResultadoTematica(
      1,
      estrategiaEmpresarial,
      mediaSectorialEstrategiaEmpresarial,
      'gobernanza-tematica-index-1',
      '.result_char.is-gobernanza-tematica-you-1',
      '.result_char.is-gobernanza-tematica-sector-1',
      'gobernanza-tematica-percent-1',
      '.result_icons.is-estrategia'
    );
    
    // Actualizar elementos de eco financiero
    mostrarResultadoTematica(
      2,
      ecoFinanciero,
      mediaSectorialEcoFinanciero,
      'gobernanza-tematica-index-2',
      '.result_char.is-gobernanza-tematica-you-2',
      '.result_char.is-gobernanza-tematica-sector-2',
      'gobernanza-tematica-percent-2',
      '.result_icons.is-financiero'
    );
    
    // Actualizar elementos de proveedores
    mostrarResultadoTematica(
      3,
      proveedores,
      mediaSectorialProveedores,
      'gobernanza-tematica-index-3',
      '.result_char.is-gobernanza-tematica-you-3',
      '.result_char.is-gobernanza-tematica-sector-3',
      'gobernanza-tematica-percent-3',
      '.result_icons.is-proveedores'
    );
    
    // Actualizar elementos de código ético
    mostrarResultadoTematica(
      4,
      codigoEtico,
      mediaSectorialCodigoEtico,
      'gobernanza-tematica-index-4',
      '.result_char.is-gobernanza-tematica-you-4',
      '.result_char.is-gobernanza-tematica-sector-4',
      'gobernanza-tematica-percent-4',
      '.result_icons.is-etico'
    );
    
    console.log('✅ [Gobernanza] Gráficas actualizadas con nuevas medias');
  }
  
  // Escuchar eventos de sheets.js
  window.addEventListener('gsbDataSent', function(event) {
    console.log('📡 [Gobernanza] Evento gsbDataSent recibido desde sheets.js');
    if (event.detail && event.detail.success) {
      console.log('🔄 [Gobernanza] Sincronizando con datos de sheets.js...');
      loadSectorialAverages();
    }
  });
  
  window.addEventListener('gsbDataSync', function(event) {
    console.log('📡 [Gobernanza] Evento gsbDataSync recibido desde sheets.js');
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
