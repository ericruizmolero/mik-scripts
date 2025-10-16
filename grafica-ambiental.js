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
  
    // 1. Impacto Climático - p18, p21.3, p22.5, p22.1, p22.2
    function calcularImpactoClimatico() {
      const p18 = extraerValor(params.get('Pregunta-18'));
      const p21_3 = extraerValor(params.get('Pregunta-21.3'));
      const p22_5 = extraerValor(params.get('Pregunta-22.5'));
      const p22_1 = extraerValor(params.get('Pregunta-22.1'));
      const p22_2 = extraerValor(params.get('Pregunta-22.2'));
      
      return (p18 + p21_3 + p22_5 + p22_1 + p22_2) / 5;
    }
  
    // 2. Gestión Sostenible - p23, p19, p22.3, p22.4, p22.6
    function calcularGestionSostenible() {
      // p23: suma de checkboxes (p23.2, p23.3, p23.4, p23.5)
      const p23_2 = params.get('p23.2-16.66666667') ? 16.67 : 0;
      const p23_3 = params.get('p23.3-16.66666667') ? 16.67 : 0;
      const p23_4 = params.get('p23.4-16.66666667') ? 16.67 : 0;
      const p23_5 = params.get('p23.5-16.66666667') ? 16.67 : 0;
      const p23 = p23_2 + p23_3 + p23_4 + p23_5;
      
      const p19 = extraerValor(params.get('Pregunta-19'));
      const p22_3 = extraerValor(params.get('Pregunta-22.3'));
      const p22_4 = extraerValor(params.get('Pregunta-22.4'));
      const p22_6 = extraerValor(params.get('Pregunta-22.6'));
      
      return (p23 + p19 + p22_3 + p22_4 + p22_6) / 5;
    }
  
    // 3. Biodiversidad y Ecosistemas - p22.7, p21.4, p20
    function calcularBiodiversidad() {
      const p22_7 = extraerValor(params.get('Pregunta-22.7'));
      const p21_4 = extraerValor(params.get('Pregunta-21.4'));
      const p20 = extraerValor(params.get('Pregunta-20'));
      
      return (p22_7 + p21_4 + p20) / 3;
    }
  
    // 4. Gestión Ambiental - p24, p21 (media de p21.1, p21.2, p21.3, p21.4)
    function calcularGestionAmbiental() {
      const p24 = extraerValor(params.get('Pregunta-24'));
      
      // p21: media de sub-preguntas (Pregunta-21.1 a Pregunta-21.4)
      const p21a = extraerValor(params.get('Pregunta-21.1'));
      const p21b = extraerValor(params.get('Pregunta-21.2'));
      const p21c = extraerValor(params.get('Pregunta-21.3'));
      const p21d = extraerValor(params.get('Pregunta-21.4'));
      const p21 = (p21a + p21b + p21c + p21d) / 4;
      
      return (p24 + p21) / 2;
    }
  
    // Calcular medias de temáticas ambientales
    const impactoClimatico = calcularImpactoClimatico();
    const gestionSostenible = calcularGestionSostenible();
    const biodiversidad = calcularBiodiversidad();
    const gestionAmbiental = calcularGestionAmbiental();
  
    // Medias sectoriales por temática
    const mediaSectorialImpactoClimatico = 28.31;
    const mediaSectorialGestionSostenible = 29.7;
    const mediaSectorialBiodiversidad = 55.92;
    const mediaSectorialGestionAmbiental = 50.67;
  
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
  
    // Mostrar resultados de las 4 temáticas ambientales
    mostrarResultadoTematica(
      1, 
      impactoClimatico, 
      mediaSectorialImpactoClimatico,
      'ambiental-tematica-index-1',
      '.result_char.is-ambiental-tematica-you-1',
      '.result_char.is-ambiental-tematica-sector-1',
      'ambiental-tematica-percent-1',
      '.result_icons.is-ambiental-tematica-1'
    );
  
    mostrarResultadoTematica(
      2, 
      gestionSostenible, 
      mediaSectorialGestionSostenible,
      'ambiental-tematica-index-2',
      '.result_char.is-ambiental-tematica-you-2',
      '.result_char.is-ambiental-tematica-sector-2',
      'ambiental-tematica-percent-2',
      '.result_icons.is-ambiental-tematica-2'
    );
  
    mostrarResultadoTematica(
      3, 
      biodiversidad, 
      mediaSectorialBiodiversidad,
      'ambiental-tematica-index-3',
      '.result_char.is-ambiental-tematica-you-3',
      '.result_char.is-ambiental-tematica-sector-3',
      'ambiental-tematica-percent-3',
      '.result_icons.is-ambiental-tematica-3'
    );
  
    mostrarResultadoTematica(
      4, 
      gestionAmbiental, 
      mediaSectorialGestionAmbiental,
      'ambiental-tematica-index-4',
      '.result_char.is-ambiental-tematica-you-4',
      '.result_char.is-ambiental-tematica-sector-4',
      'ambiental-tematica-percent-4',
      '.result_icons.is-ambiental-tematica-4'
    );
  
  })();
  