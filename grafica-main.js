(function () {
    const params = new URLSearchParams(window.location.search);
    
    // Función para extraer valor numérico de un parámetro
    function extraerValor(parametro) {
      if (!parametro) return 0;
      return Number(parametro.split('-').pop()) || 0;
    }
  
    // Función para calcular media ambiental
    function calcularMediaAmbiental() {
      const valores = [];
      
      // p1, p2, p3, p17, p18, p19, p20, p21, p22, p23, p24
      valores.push(extraerValor(params.get('Pregunta-1')));
      valores.push(extraerValor(params.get('Pregunta-2')));
      
      // p3: suma de checkboxes (p3.1, p3.4, p3.6)
      const p3_1 = params.get('p3.1-12.5') ? 12.5 : 0;
      const p3_4 = params.get('p3.4-12.5') ? 12.5 : 0;
      const p3_6 = params.get('p3.6-12.5') ? 12.5 : 0;
      const p3 = p3_1 + p3_4 + p3_6;
      valores.push(p3);
      
      valores.push(extraerValor(params.get('Pregunta-17')));
      valores.push(extraerValor(params.get('Pregunta-18')));
      valores.push(extraerValor(params.get('Pregunta-19')));
      valores.push(extraerValor(params.get('Pregunta-20')));
      
      // p21: media de sub-preguntas (Pregunta-21.1 a Pregunta-21.4)
      const p21a = extraerValor(params.get('Pregunta-21.1'));
      const p21b = extraerValor(params.get('Pregunta-21.2'));
      const p21c = extraerValor(params.get('Pregunta-21.3'));
      const p21d = extraerValor(params.get('Pregunta-21.4'));
      const p21 = (p21a + p21b + p21c + p21d) / 4; // Media de las 4 sub-preguntas
      valores.push(p21);
      
      // p22: media de sub-bloques (Pregunta-22.1 a Pregunta-22.7)
      const p22a = extraerValor(params.get('Pregunta-22.1'));
      const p22b = extraerValor(params.get('Pregunta-22.2'));
      const p22c = extraerValor(params.get('Pregunta-22.3'));
      const p22d = extraerValor(params.get('Pregunta-22.4'));
      const p22e = extraerValor(params.get('Pregunta-22.5'));
      const p22f = extraerValor(params.get('Pregunta-22.6'));
      const p22g = extraerValor(params.get('Pregunta-22.7'));
      const p22 = (p22a + p22b + p22c + p22d + p22e + p22f + p22g) / 7; // Media de las 7 sub-preguntas
      valores.push(p22);
      
      // p23: suma de checkboxes (p23.2, p23.3, p23.4, p23.5)
      const p23_2 = params.get('p23.2-16.66666667') ? 16.67 : 0;
      const p23_3 = params.get('p23.3-16.66666667') ? 16.67 : 0;
      const p23_4 = params.get('p23.4-16.66666667') ? 16.67 : 0;
      const p23_5 = params.get('p23.5-16.66666667') ? 16.67 : 0;
      const p23 = p23_2 + p23_3 + p23_4 + p23_5;
      valores.push(p23);
      
      valores.push(extraerValor(params.get('Pregunta-24')));
      
      // Calcular media
      const suma = valores.reduce((acc, val) => acc + val, 0);
      return suma / valores.length;
    }
  
    // Función para calcular media gobernanza
    function calcularMediaGobernanza() {
      const valores = [];
      
      // p4, p5, p6, p7, p14, p15, p16
      valores.push(extraerValor(params.get('Pregunta-4')));
      
      // p5: suma de checkboxes (p5.1, p5.4)
      const p5_1 = params.get('p5.1-16.66666667') ? 16.67 : 0;
      const p5_4 = params.get('p5.4-16.66666667') ? 16.67 : 0;
      const p5 = p5_1 + p5_4;
      valores.push(p5);
      
      valores.push(extraerValor(params.get('Pregunta-6')));
      valores.push(extraerValor(params.get('Pregunta-7')));
      
      // p14: media de sub-preguntas (Pregunta-14.1 a Pregunta-14.7)
      const p14a = extraerValor(params.get('Pregunta-14.1'));
      const p14b = extraerValor(params.get('Pregunta-14.2'));
      const p14c = extraerValor(params.get('Pregunta-14.3'));
      const p14d = extraerValor(params.get('Pregunta-14.4'));
      const p14e = extraerValor(params.get('Pregunta-14.5'));
      const p14f = extraerValor(params.get('Pregunta-14.6'));
      const p14g = extraerValor(params.get('Pregunta-14.7'));
      const p14 = (p14a + p14b + p14c + p14d + p14e + p14f + p14g) / 7; // Media de las 7 sub-preguntas
      valores.push(p14);
      
      valores.push(extraerValor(params.get('Pregunta-15')));
      valores.push(extraerValor(params.get('Pregunta-16')));
      
      // Calcular media
      const suma = valores.reduce((acc, val) => acc + val, 0);
      return suma / valores.length;
    }
  
    // Función para calcular media social
    function calcularMediaSocial() {
      const valores = [];
      
      // p8, p9, p10, p11, p12, p13, p25, p26, p27, p28
      valores.push(extraerValor(params.get('Pregunta-8')));
      
      // p9: media de sub-preguntas (Pregunta-9.1 a Pregunta-9.8)
      const p9a = extraerValor(params.get('Pregunta-9.1'));
      const p9b = extraerValor(params.get('Pregunta-9.2'));
      const p9c = extraerValor(params.get('Pregunta-9.3'));
      const p9d = extraerValor(params.get('Pregunta-9.4'));
      const p9e = extraerValor(params.get('Pregunta-9.5'));
      const p9f = extraerValor(params.get('Pregunta-9.6'));
      const p9g = extraerValor(params.get('Pregunta-9.7'));
      const p9h = extraerValor(params.get('Pregunta-9.8'));
      const p9 = (p9a + p9b + p9c + p9d + p9e + p9f + p9g + p9h) / 8; // Media de las 8 sub-preguntas
      valores.push(p9);
      
      valores.push(extraerValor(params.get('Pregunta-10')));
      
      // p11: suma de checkboxes (p11.1, p11.2, p11.4)
      const p11_1 = params.get('p11.1-25') ? 25 : 0;
      const p11_2 = params.get('p11.2-25') ? 25 : 0;
      const p11_4 = params.get('p11.4-25') ? 25 : 0;
      const p11 = p11_1 + p11_2 + p11_4;
      valores.push(p11);
      
      // p12: media de sub-preguntas (Pregunta-12.1 a Pregunta-12.8)
      const p12a = extraerValor(params.get('Pregunta-12.1'));
      const p12b = extraerValor(params.get('Pregunta-12.2'));
      const p12c = extraerValor(params.get('Pregunta-12.3'));
      const p12d = extraerValor(params.get('Pregunta-12.4'));
      const p12e = extraerValor(params.get('Pregunta-12.5'));
      const p12f = extraerValor(params.get('Pregunta-12.6'));
      const p12g = extraerValor(params.get('Pregunta-12.7'));
      const p12h = extraerValor(params.get('Pregunta-12.8'));
      const p12 = (p12a + p12b + p12c + p12d + p12e + p12f + p12g + p12h) / 8; // Media de las 8 sub-preguntas
      valores.push(p12);
      
      // p13: suma de checkboxes (p13.1, p13.2, p13.4)
      const p13_1 = params.get('p13.1-14.29') ? 14.29 : 0;
      const p13_2 = params.get('p13.2-14.29') ? 14.29 : 0;
      const p13_4 = params.get('p13.4-14.29') ? 14.29 : 0;
      const p13 = p13_1 + p13_2 + p13_4;
      valores.push(p13);
      
      // p25: media de sub-preguntas (Pregunta-25.1 a Pregunta-25.7)
      const p25a = extraerValor(params.get('Pregunta-25.1'));
      const p25b = extraerValor(params.get('Pregunta-25.2'));
      const p25c = extraerValor(params.get('Pregunta-25.3'));
      const p25d = extraerValor(params.get('Pregunta-25.4'));
      const p25e = extraerValor(params.get('Pregunta-25.5'));
      const p25f = extraerValor(params.get('Pregunta-25.6'));
      const p25g = extraerValor(params.get('Pregunta-25.7'));
      const p25 = (p25a + p25b + p25c + p25d + p25e + p25f + p25g) / 7; // Media de las 7 sub-preguntas
      valores.push(p25);
      
      // p26: suma de checkboxes (p26.1, p26.2)
      const p26_1 = params.get('p26.1-33.33') ? 33.33 : 0;
      const p26_2 = params.get('p26.2-33.33') ? 33.33 : 0;
      const p26 = p26_1 + p26_2;
      valores.push(p26);
      
      valores.push(extraerValor(params.get('Pregunta-27')));
      valores.push(extraerValor(params.get('Pregunta-28')));
      
      // Calcular media
      const suma = valores.reduce((acc, val) => acc + val, 0);
      return suma / valores.length;
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
  
    // Medias sectoriales (valores fijos por ahora)
    const mediaSectorialAmbiental = 41.15;
    const mediaSectorialSocial = 49.16;
    const mediaSectorialGobernanza = 46.6875;
    const mediaSectorialESG = 45.66583333;
  
    // Aplicar medias sectoriales como alturas
    const elementoAmbientalSector = document.querySelector('.result_char.is-ambiental-sector');
    if (elementoAmbientalSector) {
      elementoAmbientalSector.style.setProperty('height', Math.round(mediaSectorialAmbiental) + '%', 'important')
    }
  
    const elementoSocialSector = document.querySelector('.result_char.is-social-sector');
    if (elementoSocialSector) {
      elementoSocialSector.style.setProperty('height', Math.round(mediaSectorialSocial) + '%', 'important')
    }
  
    const elementoGobernanzaSector = document.querySelector('.result_char.is-gobernanza-sector');
    if (elementoGobernanzaSector) {
      elementoGobernanzaSector.style.setProperty('height', Math.round(mediaSectorialGobernanza) + '%', 'important')
    }
  
    const elementoESGSector = document.querySelector('.result_char.is-esg-sector');
    if (elementoESGSector) {
      elementoESGSector.style.setProperty('height', Math.round(mediaSectorialESG) + '%', 'important')
    }
  
    // Comparativa Ambiental: tu empresa vs sector
    const diferenciaAmbiental = mediaAmbiental - mediaSectorialAmbiental;
    const diferenciaAmbientalRedondeada = Math.round(diferenciaAmbiental * 10) / 10; // Redondear a 1 decimal
    
    const elAmbientalPercent = document.getElementById('ambiental-percent');
    if (elAmbientalPercent) {
      if (diferenciaAmbientalRedondeada >= 0) {
        elAmbientalPercent.textContent = '+' + diferenciaAmbientalRedondeada + '%';
      } else {
        elAmbientalPercent.textContent = diferenciaAmbientalRedondeada + '%';
      }
    }
  
    // Aplicar clases según si es positivo o negativo
    const elementoAmbientalIcons = document.querySelector('.result_icons.is-ambiental');
    if (elementoAmbientalIcons) {
      const iconGreen = elementoAmbientalIcons.querySelector('.result_icon-green');
      const iconRed = elementoAmbientalIcons.querySelector('.result_icon-red');
      
      if (diferenciaAmbientalRedondeada >= 0) {
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
  
    // Comparativa Social: tu empresa vs sector
    const diferenciaSocial = mediaSocial - mediaSectorialSocial;
    const diferenciaSocialRedondeada = Math.round(diferenciaSocial * 10) / 10; // Redondear a 1 decimal
    
    const elSocialPercent = document.getElementById('social-percent');
    if (elSocialPercent) {
      if (diferenciaSocialRedondeada >= 0) {
        elSocialPercent.textContent = '+' + diferenciaSocialRedondeada + '%';
      } else {
        elSocialPercent.textContent = diferenciaSocialRedondeada + '%';
      }
    }
  
    // Aplicar clases según si es positivo o negativo
    const elementoSocialIcons = document.querySelector('.result_icons.is-social');
    if (elementoSocialIcons) {
      const iconGreen = elementoSocialIcons.querySelector('.result_icon-green');
      const iconRed = elementoSocialIcons.querySelector('.result_icon-red');
      
      if (diferenciaSocialRedondeada >= 0) {
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
  
    // Comparativa Gobernanza: tu empresa vs sector
    const diferenciaGobernanza = mediaGobernanza - mediaSectorialGobernanza;
    const diferenciaGobernanzaRedondeada = Math.round(diferenciaGobernanza * 10) / 10; // Redondear a 1 decimal
    
    const elGobernanzaPercent = document.getElementById('gobernanza-percent');
    if (elGobernanzaPercent) {
      if (diferenciaGobernanzaRedondeada >= 0) {
        elGobernanzaPercent.textContent = '+' + diferenciaGobernanzaRedondeada + '%';
      } else {
        elGobernanzaPercent.textContent = diferenciaGobernanzaRedondeada + '%';
      }
    }
  
    // Aplicar clases según si es positivo o negativo
    const elementoGobernanzaIcons = document.querySelector('.result_icons.is-gobernanza');
    if (elementoGobernanzaIcons) {
      const iconGreen = elementoGobernanzaIcons.querySelector('.result_icon-green');
      const iconRed = elementoGobernanzaIcons.querySelector('.result_icon-red');
      
      if (diferenciaGobernanzaRedondeada >= 0) {
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
  
    // Comparativa GSB Index: tu empresa vs sector
    const diferenciaGsbIndex = gsbIndex - mediaSectorialESG;
    const diferenciaGsbIndexRedondeada = Math.round(diferenciaGsbIndex * 10) / 10; // Redondear a 1 decimal
    
    const elGsbIndexPercent = document.getElementById('gsbindex-percent');
    if (elGsbIndexPercent) {
      if (diferenciaGsbIndexRedondeada >= 0) {
        elGsbIndexPercent.textContent = '+' + diferenciaGsbIndexRedondeada + '%';
      } else {
        elGsbIndexPercent.textContent = diferenciaGsbIndexRedondeada + '%';
      }
    }
  
    // Aplicar clases según si es positivo o negativo
    const elementoGsbIcons = document.querySelector('.result_icons.is-gsb');
    if (elementoGsbIcons) {
      const iconGreen = elementoGsbIcons.querySelector('.result_icon-green');
      const iconRed = elementoGsbIcons.querySelector('.result_icon-red');
      
      if (diferenciaGsbIndexRedondeada >= 0) {
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
  
    // Mostrar información de la empresa
    const email = params.get('Email');
    const empresa = params.get('Compañia');
    
    const elEmail = document.getElementById('correo');
    if (elEmail && email) {
      elEmail.textContent = decodeURIComponent(email);
    }
    
    const elEmpresa = document.getElementById('empresa');
    if (elEmpresa && empresa) {
      elEmpresa.textContent = decodeURIComponent(empresa);
    }
  
    // Limpia la URL (sin recargar la página) - COMENTADO PARA PRUEBAS
    // if (window.history.replaceState) {
    //   window.history.replaceState({}, document.title, '/resultado');
    // }
  })();
  