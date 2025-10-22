/**
 * Sistema de integración con Google Sheets para GSBIndex
 * Recolecta datos del formulario y calcula medias sectoriales automáticamente
 */

class GSBSheetsIntegration {
  constructor() {
    this.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAbQgeZF_1nbNyYGBhA_6HFBBLvPqU3x6qcwBXECrlbznknylp4GbX3n1NW8E_sVf5eQ/exec';
    
    // Función para generar timestamp en horario español
    this.getSpanishTimestamp = () => {
      const now = new Date();
      // Convertir a horario español (UTC+1 en invierno, UTC+2 en verano)
      const spanishTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
      return spanishTime.toISOString();
    }; // ⚠️ REEMPLAZA CON LA URL FINAL DE LA IMPLEMENTACIÓN
        this.isInitialized = false;
        this.sectorialCache = new Map(); // Cache para evitar llamadas duplicadas
        this.pendingRequests = new Map(); // Control de requests pendientes
        console.log('🚀 Iniciando sheets.js...');
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        // Esperar a que el DOM esté cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
        } else {
            this.setupIntegration();
        }
        
        this.isInitialized = true;
    }

    setupIntegration() {
        // Verificar si la URL es demasiado larga para el navegador
        if (window.location.href.length > 8000) {
            console.log('⚠️ URL demasiado larga para el navegador, usando método alternativo');
            this.handleLongURL();
            return;
        }
        
        // Extraer parámetros de la URL (con soporte para datos comprimidos)
        const params = this.extractParams();
        
        // Solo procesar si hay datos del formulario
        if (this.hasFormData(params)) {
            console.log(`📊 Parámetros detectados: ${params.size}`);
            console.log('📋 Primeros parámetros:', Array.from(params.entries()).slice(0, 5));
            this.processFormData(params);
        } else {
            console.log('⚠️ No se detectaron datos del formulario');
        }
    }
    
    // Función para decodificar datos comprimidos
    decodeFormData(compressedData) {
        try {
            const decoded = atob(compressedData);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('❌ Error decodificando datos comprimidos:', error);
            return null;
        }
    }

    // Extraer parámetros de la URL (con soporte para URL híbrida)
    extractParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Verificar si los datos vienen comprimidos desde el formulario (URL híbrida)
        const compressedData = urlParams.get('data');
        const isCompressed = urlParams.get('compressed') === 'true';
        
        if (isCompressed && compressedData) {
            console.log('📦 [Sheets] Detectados datos comprimidos del formulario (URL híbrida)');
            try {
                const decodedData = this.decodeFormData(compressedData);
                if (decodedData) {
                    console.log('✅ [Sheets] Datos decodificados correctamente:', Object.keys(decodedData).length, 'parámetros');
                    
                    // Almacenar datos decodificados globalmente para que las gráficas puedan acceder
                    window.decodedFormData = decodedData;
                    console.log('🌐 [Sheets] Datos almacenados globalmente en window.decodedFormData');
                    
                    // Crear URLSearchParams combinando datos directos de URL + datos decodificados
                    const combinedParams = new URLSearchParams();
                    
                    // Primero agregar todos los parámetros directos de la URL (datos críticos)
                    for (const [key, value] of urlParams.entries()) {
                        if (key !== 'data' && key !== 'compressed') {
                            combinedParams.append(key, value);
                        }
                    }
                    
                    // Luego agregar datos decodificados (datos básicos) solo si no existen ya
                    for (const [key, value] of Object.entries(decodedData)) {
                        if (!combinedParams.has(key)) {
                            combinedParams.append(key, value);
                        }
                    }
                    
                    console.log('📊 [Sheets] Parámetros combinados:', combinedParams.size, 'total');
                    console.log('📊 [Sheets] Sector:', combinedParams.get('Sector'));
                    console.log('📊 [Sheets] Tamaño:', combinedParams.get('Tamaño-de-tu-empresa'));
                    console.log('📊 [Sheets] Email:', combinedParams.get('Email'));
                    console.log('📊 [Sheets] Compañia:', combinedParams.get('Compañia'));
                    
                    return combinedParams;
                }
            } catch (error) {
                console.error('❌ [Sheets] Error decodificando datos comprimidos:', error);
            }
        }
        
        // Si no hay datos comprimidos o falló la decodificación, usar parámetros normales
        console.log('📊 [Sheets] Usando parámetros directos de URL:', urlParams.size, 'parámetros');
        return urlParams;
    }
    
    // Método para manejar URLs demasiado largas
    handleLongURL() {
        try {
            console.log('🔄 Procesando URL larga...');
            
            // Intentar extraer datos básicos de la URL actual
            const url = window.location.href;
            const baseUrl = url.split('?')[0];
            const queryString = url.split('?')[1];
            
            if (!queryString) {
                console.error('❌ No se encontraron parámetros en la URL');
                return;
            }
            
            // Dividir la query string en partes más pequeñas si es necesario
            let params;
            try {
                params = new URLSearchParams(queryString);
                console.log(`📊 Parámetros extraídos: ${params.size}`);
            } catch (error) {
                console.log('⚠️ Error creando URLSearchParams, usando método manual');
                params = this.parseQueryStringManually(queryString);
            }
            
            // Procesar los datos
            this.processFormDataAlternative(params);
            
        } catch (error) {
            console.error('❌ Error procesando URL larga:', error);
            
            // Mostrar mensaje al usuario
            this.showURLErrorMessage();
        }
    }
    
    // Método manual para parsear query string cuando URLSearchParams falla
    parseQueryStringManually(queryString) {
        const params = new Map();
        
        try {
            // Dividir por & y procesar cada parámetro
            const pairs = queryString.split('&');
            
            for (const pair of pairs) {
                if (pair.includes('=')) {
                    const [key, value] = pair.split('=', 2);
                    if (key && value !== undefined) {
                        params.set(decodeURIComponent(key), decodeURIComponent(value));
                    }
                }
            }
            
            console.log(`📊 Parámetros parseados manualmente: ${params.size}`);
            return params;
            
        } catch (error) {
            console.error('❌ Error parseando query string manualmente:', error);
            return new Map();
        }
    }
    
    // Mostrar mensaje de error al usuario
    showURLErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        errorDiv.innerHTML = `
            <strong>⚠️ URL Demasiado Larga</strong><br>
            La URL contiene demasiados parámetros para ser procesada directamente.<br>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: white; color: #ff4444; border: none; border-radius: 3px; cursor: pointer;">
                Cerrar
            </button>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }
    
    // Método alternativo para URLs muy largas
    async processFormDataAlternative(params) {
        try {
            console.log('🔄 Procesando datos con método alternativo...');
            console.log(`📊 Total de parámetros: ${params.size}`);
            
            // Mostrar indicador de progreso
            this.showProgressIndicator();
            
            // Extraer datos básicos primero
            const formData = this.extractFormData(params);
            
            // Calcular métricas
            const metrics = this.calculateAllMetrics(formData);
            const completeData = { ...formData, ...metrics };
            
            console.log('📊 Datos completos procesados:', completeData);
            
            // Enviar a Google Sheets usando POST (no GET)
            await this.sendToSheets(completeData);
            
            // Ocultar indicador de progreso
            this.hideProgressIndicator();
            
            // Mostrar mensaje de éxito
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('❌ Error procesando datos alternativos:', error);
            this.hideProgressIndicator();
            this.showErrorMessage(error.message);
        }
    }
    
    // Mostrar indicador de progreso
    showProgressIndicator() {
        const progressDiv = document.createElement('div');
        progressDiv.id = 'gsb-progress';
        progressDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        progressDiv.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <div>Procesando datos del formulario...</div>
            <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Enviando a Google Sheets</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(progressDiv);
    }
    
    // Ocultar indicador de progreso
    hideProgressIndicator() {
        const progressDiv = document.getElementById('gsb-progress');
        if (progressDiv) {
            progressDiv.remove();
        }
    }
    
    // Mostrar mensaje de éxito
    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        successDiv.innerHTML = `
            <strong>✅ Datos Procesados</strong><br>
            Los datos esenciales se han enviado a Google Sheets.<br>
            <small>Los datos completos se han guardado localmente como respaldo.</small>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: white; color: #4CAF50; border: none; border-radius: 3px; cursor: pointer;">
                Cerrar
            </button>
        `;
        document.body.appendChild(successDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 5000);
    }
    
    // Mostrar mensaje de error
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        errorDiv.innerHTML = `
            <strong>❌ Error</strong><br>
            ${message}
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: white; color: #ff4444; border: none; border-radius: 3px; cursor: pointer;">
                Cerrar
            </button>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    hasFormData(params) {
        // Verificar si hay datos del formulario en la URL (URL híbrida)
        const email = params.get('Email') || params.get('email');
        const empresa = params.get('Compañia') || params.get('Compania');
        const sector = params.get('Sector');
        const tamano = params.get('Tamaño-de-tu-empresa');
        
        // También verificar si hay datos comprimidos
        const compressedData = params.get('data');
        const isCompressed = params.get('compressed') === 'true';
        
        if (isCompressed && compressedData) {
            console.log('📦 [Sheets] Detectando datos comprimidos en hasFormData (URL híbrida)');
            return true;
        }
        
        // Verificar datos críticos de la URL híbrida
        const hasCriticalData = !!(email && empresa && sector && tamano);
        if (hasCriticalData) {
            console.log('✅ [Sheets] Datos críticos detectados en URL híbrida');
            return true;
        }
        
        // Fallback: verificar datos básicos tradicionales
        const hasBasicData = !!(email && empresa);
        if (hasBasicData) {
            console.log('✅ [Sheets] Datos básicos detectados en URL tradicional');
            return true;
        }
        
        console.log('⚠️ [Sheets] No se detectaron datos del formulario');
        return false;
    }

    async processFormData(params) {
        try {
            // Procesando datos del formulario (URL híbrida)...
            
            // Extraer datos básicos
            const formData = this.extractFormData(params);
            console.log('📋 [Sheets] Datos extraídos:', Object.keys(formData).length, 'campos');
            
            // Calcular todas las métricas
            const metrics = this.calculateAllMetrics(params);
            console.log('📊 [Sheets] Métricas calculadas:', Object.keys(metrics).length, 'métricas');
            
            // Combinar datos
            const completeData = {
                ...formData,
                ...metrics,
                timestamp: this.getSpanishTimestamp()
            };
            
            console.log('📤 [Sheets] Datos completos a enviar:', Object.keys(completeData).length, 'campos');
            console.log('📊 [Sheets] Métricas calculadas:', {
                media_ambiental: completeData.media_ambiental,
                media_social: completeData.media_social,
                media_gobernanza: completeData.media_gobernanza,
                gsb_index_total: completeData.gsb_index_total
            });

            // Enviar a Google Sheets
            const result = await this.sendToSheets(completeData);
            console.log('📤 [Sheets] Resultado del envío:', result);
            
            if (result.success) {
                console.log('✅ [Sheets] Datos enviados correctamente a Google Sheets');
                
                // Disparar evento para que grafica-main.js se ejecute inmediatamente
                console.log('🚀 [Sheets] Disparando evento gsbDataSent para grafica-main.js...');
                const event = new CustomEvent('gsbDataSent', {
                    detail: {
                        success: true,
                        result: result,
                        calculatedData: {
                            impacto_climatico: completeData.impacto_climatico,
                            gestion_sostenible: completeData.gestion_sostenible,
                            biodiversidad: completeData.biodiversidad,
                            gestion_ambiental: completeData.gestion_ambiental,
                            interno: completeData.interno,
                            externo: completeData.externo,
                            estrategia_empresarial: completeData.estrategia_empresarial,
                            eco_financiero: completeData.eco_financiero,
                            proveedores: completeData.proveedores,
                            codigo_etico: completeData.codigo_etico,
                            media_ambiental: completeData.media_ambiental,
                            media_social: completeData.media_social,
                            media_gobernanza: completeData.media_gobernanza,
                            gsb_index_total: completeData.gsb_index_total
                        },
                        timestamp: this.getSpanishTimestamp()
                    }
                });
                window.dispatchEvent(event);
                console.log('✅ [Sheets] Evento gsbDataSent disparado con datos calculados');
                
                // Hacer gsbSheets disponible globalmente para las gráficas
                window.gsbSheets = this;
                console.log('🌐 [Sheets] gsbSheets disponible globalmente');
                
            } else {
                console.error('❌ [Sheets] Error enviando datos:', result.error);
            }
            
        } catch (error) {
            console.error('❌ [Sheets] Error procesando datos:', error);
            console.error('Detalles del error:', error.stack);
        }
    }

    extractFormData(params) {
        // Datos básicos de la empresa usando función auxiliar
        const email = this.getParamValue(params, 'Email', 'email');
        const empresa = this.getParamValue(params, 'Compañia', 'Compania');
        const municipio = this.getParamValue(params, 'Municipio');
        const territorio = this.getParamValue(params, 'Territorio');
        const persona_contacto = this.getParamValue(params, 'Persona de contacto', 'Persona+de+contacto');
        const sector = this.getParamValue(params, 'Sector');
        const tamano_empresa = this.getParamValue(params, 'Tamaño de tu empresa', 'Tama-o-de-tu-empresa');
        const cnae = this.getParamValue(params, 'CNAE');
        const antiguedad_empresa = this.getParamValue(params, 'Antigüedad de la empresa', 'Antig-edad-de-la-empresa');
        const plantas_extranjero = this.getParamValue(params, 'Su empresa cuenta con plantas productivas o delegaciones en el extranjero', 'Su-empresa-cuenta-con-plantas-productivas-o-delegaciones-en-el-extranjero');
        const tipo_economia_social = this.getParamValue(params, 'Tipo de empresa de economía social al que pertenece', 'Tipo-de-empresa-de-econom-a-social-al-que-pertenece');
        const departamento = this.getParamValue(params, 'En qué departamento de la empresa trabaja', 'En-qu-departamento-de-la-empresa-trabaja');
        const nombre = this.getParamValue(params, 'Nombre');
        
        // Extraer todas las respuestas del formulario
        const responses = {};
        
        // Preguntas principales (P1-P28)
        for (let i = 1; i <= 28; i++) {
            const value = params.get(`Pregunta-${i}`);
            if (value) {
                responses[`P${i}`] = this.extractNumericValue(value);
            }
        }
        
        // Sub-preguntas específicas
        const subQuestions = [
            'Pregunta-9.1', 'Pregunta-9.2', 'Pregunta-9.3', 'Pregunta-9.4', 'Pregunta-9.5', 'Pregunta-9.6', 'Pregunta-9.7', 'Pregunta-9.8',
            'Pregunta-12.1', 'Pregunta-12.2', 'Pregunta-12.3', 'Pregunta-12.4', 'Pregunta-12.5', 'Pregunta-12.6', 'Pregunta-12.7', 'Pregunta-12.8',
            'Pregunta-14.1', 'Pregunta-14.2', 'Pregunta-14.3', 'Pregunta-14.4', 'Pregunta-14.5', 'Pregunta-14.6', 'Pregunta-14.7',
            'Pregunta-21.1', 'Pregunta-21.2', 'Pregunta-21.3', 'Pregunta-21.4',
            'Pregunta-22.1', 'Pregunta-22.2', 'Pregunta-22.3', 'Pregunta-22.4', 'Pregunta-22.5', 'Pregunta-22.6', 'Pregunta-22.7',
            'Pregunta-25.1', 'Pregunta-25.2', 'Pregunta-25.3', 'Pregunta-25.4', 'Pregunta-25.5', 'Pregunta-25.6', 'Pregunta-25.7'
        ];
        
        subQuestions.forEach(question => {
            const value = params.get(question);
            if (value) {
                const key = question.replace('Pregunta-', 'P');
                responses[key] = this.extractNumericValue(value);
            }
        });
        
        // Checkboxes específicos - TODOS los posibles (incluyendo los que pueden no aparecer)
        const checkboxes = [
            // Pregunta 3 - todos los checkboxes posibles
            'p3.1-12.5', 'p3.2-12.5', 'p3.3-12.5', 'p3.4-12.5', 'p3.5-12.5', 'p3.6-12.5', 'p3.7-12.5', 'p3.8-12.5',
            // Pregunta 5 - todos los checkboxes posibles
            'p5.1-16.66666667', 'p5.2-16.66666667', 'p5.3-16.66666667', 'p5.4-16.66666667', 'p5.5-16.66666667', 'p5.6-16.66666667',
            // Pregunta 11 - todos los checkboxes posibles (incluyendo p11.5-0)
            'p11.1-25', 'p11.2-25', 'p11.3-25', 'p11.4-25', 'p11.5-0',
            // Pregunta 13 - todos los checkboxes posibles
            'p13.1-14.29', 'p13.2-14.29', 'p13.3-14.29', 'p13.4-14.29', 'p13.5-14.29', 'p13.6-14.29', 'p13.7-14.29',
            // Pregunta 23 - todos los checkboxes posibles (incluyendo p23.1 y p23.7)
            'p23.1-16.66666667', 'p23.2-16.66666667', 'p23.3-16.66666667', 'p23.4-16.66666667', 'p23.5-16.66666667', 'p23.6-16.66666667', 'p23.7-0',
            // Pregunta 26 - todos los checkboxes posibles (incluyendo p26.4-0)
            'p26.1-33.33', 'p26.2-33.33', 'p26.3-33.33', 'p26.4-0'
        ];
        
        checkboxes.forEach(checkbox => {
            const key = checkbox.replace('-', '_');
            const value = this.extractCheckboxValue(params, checkbox);
            responses[key] = value;
            
            // Debug específico para checkboxes
            if (value > 0) {
                console.log(`✅ Checkbox ${checkbox} marcado con valor: ${value}`);
            } else {
                console.log(`❌ Checkbox ${checkbox} no marcado (valor: ${value})`);
            }
        });

        // Campos adicionales
        const pf1 = this.getParamValue(params, 'pf1');
        const pf2 = this.getParamValue(params, 'pf2');

        return {
            email: decodeURIComponent(email),
            empresa: decodeURIComponent(empresa),
            municipio: decodeURIComponent(municipio),
            territorio: decodeURIComponent(territorio),
            persona_contacto: decodeURIComponent(persona_contacto),
            sector: decodeURIComponent(sector),
            tamano_empresa: decodeURIComponent(tamano_empresa),
            cnae: decodeURIComponent(cnae),
            antiguedad_empresa: decodeURIComponent(antiguedad_empresa),
            plantas_extranjero: decodeURIComponent(plantas_extranjero),
            tipo_economia_social: decodeURIComponent(tipo_economia_social),
            departamento: decodeURIComponent(departamento),
            nombre: decodeURIComponent(nombre),
            pf1: decodeURIComponent(pf1),
            pf2: decodeURIComponent(pf2),
            ...responses
        };
    }

    extractNumericValue(param) {
        if (!param) return 0;
        
        // Si el parámetro es "on" (checkbox marcado), extraer el valor del nombre del parámetro
        if (param === 'on') {
            return 0; // Se manejará en el contexto específico
        }
        
        return Number(param.split('-').pop()) || 0;
    }

    // Función auxiliar para obtener parámetros con múltiples variaciones
    getParamValue(params, ...variations) {
        for (const variation of variations) {
            const value = params.get(variation);
            if (value) return value;
        }
        return '';
    }

    // Función específica para extraer valores de checkboxes
    extractCheckboxValue(params, paramName) {
        const value = params.get(paramName);
        console.log(`🔍 Verificando checkbox ${paramName}: valor="${value}"`);
        
        if (value === 'on') {
            // Si está marcado, extraer el valor del nombre del parámetro
            const numericValue = paramName.split('-').pop();
            const result = Number(numericValue) || 0;
            console.log(`✅ Checkbox ${paramName} marcado con valor: ${result}`);
            return result;
        }
        
        console.log(`❌ Checkbox ${paramName} no marcado (valor: ${value})`);
        return 0;
    }

    calculateAllMetrics(params) {
        console.log('🧮 Calculando métricas...');
        
        // Calcular métricas ambientales
        const media_ambiental = this.calculateMediaAmbiental(params);
        const impacto_climatico = this.calculateImpactoClimatico(params);
        const gestion_sostenible = this.calculateGestionSostenible(params);
        const biodiversidad = this.calculateBiodiversidad(params);
        const gestion_ambiental = this.calculateGestionAmbiental(params);
        
        // Calcular métricas sociales
        const media_social = this.calculateMediaSocial(params);
        const estrategia_empresarial = this.calculateEstrategiaEmpresarial(params);
        const eco_financiero = this.calculateEcoFinanciero(params);
        const proveedores = this.calculateProveedores(params);
        const codigo_etico = this.calculateCodigoEtico(params);
        
        // Calcular métricas de gobernanza
        const media_gobernanza = this.calculateMediaGobernanza(params);
        const interno = this.calculateInterno(params);
        const externo = this.calculateExterno(params);
        
        // Calcular GSB Index total
        const gsb_index_total = (media_ambiental + media_social + media_gobernanza) / 3;
        
        const metrics = {
            media_ambiental,
            media_social,
            media_gobernanza,
            gsb_index_total,
            impacto_climatico,
            gestion_sostenible,
            biodiversidad,
            gestion_ambiental,
            estrategia_empresarial,
            eco_financiero,
            proveedores,
            codigo_etico,
            interno,
            externo
        };
        
        console.log('📊 Métricas calculadas:', metrics);
        return metrics;
    }

    // Cálculos ambientales (usando la misma lógica que grafica-ambiental.js)
    calculateMediaAmbiental(params) {
        const impactoClimatico = this.calculateImpactoClimatico(params);
        const gestionSostenible = this.calculateGestionSostenible(params);
        const biodiversidad = this.calculateBiodiversidad(params);
        const gestionAmbiental = this.calculateGestionAmbiental(params);
        
        return (impactoClimatico + gestionSostenible + biodiversidad + gestionAmbiental) / 4;
    }

    calculateImpactoClimatico(params) {
        const p17 = this.extractNumericValue(params.get('Pregunta-17'));
        const p18 = this.extractNumericValue(params.get('Pregunta-18'));
        const p21_3 = this.extractNumericValue(params.get('Pregunta-21.3'));
        const p22_5 = this.extractNumericValue(params.get('Pregunta-22.5'));
        const p22_1 = this.extractNumericValue(params.get('Pregunta-22.1'));
        const p22_2 = this.extractNumericValue(params.get('Pregunta-22.2'));
        
        return (p17 + p18 + p21_3 + p22_5 + p22_1 + p22_2) / 6;
    }

    calculateGestionSostenible(params) {
        // p23: suma de checkboxes (p23.2, p23.3, p23.4, p23.5)
        const p23_2 = params.get('p23.2-16.66666667') ? 16.67 : 0;
        const p23_3 = params.get('p23.3-16.66666667') ? 16.67 : 0;
        const p23_4 = params.get('p23.4-16.66666667') ? 16.67 : 0;
        const p23_5 = params.get('p23.5-16.66666667') ? 16.67 : 0;
        const p23 = p23_2 + p23_3 + p23_4 + p23_5;
        
        const p19 = this.extractNumericValue(params.get('Pregunta-19'));
        const p22_3 = this.extractNumericValue(params.get('Pregunta-22.3'));
        const p22_4 = this.extractNumericValue(params.get('Pregunta-22.4'));
        const p22_6 = this.extractNumericValue(params.get('Pregunta-22.6'));
        
        return (p23 + p19 + p22_3 + p22_4 + p22_6) / 5;
    }

    calculateBiodiversidad(params) {
        const p22_7 = this.extractNumericValue(params.get('Pregunta-22.7'));
        const p21_4 = this.extractNumericValue(params.get('Pregunta-21.4'));
        const p20 = this.extractNumericValue(params.get('Pregunta-20'));
        
        return (p22_7 + p21_4 + p20) / 3;
    }

    calculateGestionAmbiental(params) {
        const p24 = this.extractNumericValue(params.get('Pregunta-24'));
        const p21a = this.extractNumericValue(params.get('Pregunta-21.1'));
        const p21b = this.extractNumericValue(params.get('Pregunta-21.2'));
        const p21 = (p21a + p21b) / 2;
        
        return (p24 + p21) / 2;
    }

    // Cálculos de gobernanza (usando la misma lógica que grafica-gobernanza.js)
    calculateMediaGobernanza(params) {
        const estrategiaEmpresarial = this.calculateEstrategiaEmpresarial(params);
        const ecoFinanciero = this.calculateEcoFinanciero(params);
        const proveedores = this.calculateProveedores(params);
        const codigoEtico = this.calculateCodigoEtico(params);
        
        return (estrategiaEmpresarial + ecoFinanciero + proveedores + codigoEtico) / 4;
    }

    calculateEstrategiaEmpresarial(params) {
        const p1 = this.extractNumericValue(params.get('Pregunta-1'));
        const p2 = this.extractNumericValue(params.get('Pregunta-2'));
        
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

    calculateEcoFinanciero(params) {
        const p25a = this.extractNumericValue(params.get('Pregunta-25.1'));
        const p25b = this.extractNumericValue(params.get('Pregunta-25.2'));
        const p25c = this.extractNumericValue(params.get('Pregunta-25.3'));
        const p25d = this.extractNumericValue(params.get('Pregunta-25.4'));
        const p25e = this.extractNumericValue(params.get('Pregunta-25.5'));
        const p25f = this.extractNumericValue(params.get('Pregunta-25.6'));
        const p25g = this.extractNumericValue(params.get('Pregunta-25.7'));
        const p25 = (p25a + p25b + p25c + p25d + p25e + p25f + p25g) / 7;
        
        const p26_1 = params.get('p26.1-33.33') ? 33.33 : 0;
        const p26_2 = params.get('p26.2-33.33') ? 33.33 : 0;
        const p26_3 = params.get('p26.3-33.33') ? 33.33 : 0;
        const p26 = p26_1 + p26_2 + p26_3;
        
        const p27 = this.extractNumericValue(params.get('Pregunta-27'));
        const p28 = this.extractNumericValue(params.get('Pregunta-28'));
        
        return (p25 + p26 + p27 + p28) / 4;
    }

    calculateProveedores(params) {
        const p14a = this.extractNumericValue(params.get('Pregunta-14.1'));
        const p14b = this.extractNumericValue(params.get('Pregunta-14.2'));
        const p14c = this.extractNumericValue(params.get('Pregunta-14.3'));
        const p14d = this.extractNumericValue(params.get('Pregunta-14.4'));
        const p14e = this.extractNumericValue(params.get('Pregunta-14.5'));
        const p14f = this.extractNumericValue(params.get('Pregunta-14.6'));
        const p14g = this.extractNumericValue(params.get('Pregunta-14.7'));
        const p14 = (p14a + p14b + p14c + p14d + p14e + p14f + p14g) / 7;
        
        const p15 = this.extractNumericValue(params.get('Pregunta-15'));
        const p16 = this.extractNumericValue(params.get('Pregunta-16'));
        
        return (p14 + p15 + p16) / 3;
    }

    calculateCodigoEtico(params) {
        const p4 = this.extractNumericValue(params.get('Pregunta-4'));
        
        const p5_1 = params.get('p5.1-16.66666667') ? 16.67 : 0;
        const p5_2 = params.get('p5.2-16.66666667') ? 16.67 : 0;
        const p5_3 = params.get('p5.3-16.66666667') ? 16.67 : 0;
        const p5_4 = params.get('p5.4-16.66666667') ? 16.67 : 0;
        const p5_5 = params.get('p5.5-16.66666667') ? 16.67 : 0;
        const p5_6 = params.get('p5.6-16.66666667') ? 16.67 : 0;
        const p5 = p5_1 + p5_2 + p5_3 + p5_4 + p5_5 + p5_6;
        
        const p6 = this.extractNumericValue(params.get('Pregunta-6'));
        const p7 = this.extractNumericValue(params.get('Pregunta-7'));
        
        return (p4 + p5 + p6 + p7) / 4;
    }

    // Cálculos sociales (usando la misma lógica que grafica-social.js)
    calculateMediaSocial(params) {
        const interno = this.calculateInterno(params);
        const externo = this.calculateExterno(params);
        
        return (interno + externo) / 2;
    }

    calculateInterno(params) {
        const p8 = this.extractNumericValue(params.get('Pregunta-8'));
        
        const p9a = this.extractNumericValue(params.get('Pregunta-9.1'));
        const p9b = this.extractNumericValue(params.get('Pregunta-9.2'));
        const p9c = this.extractNumericValue(params.get('Pregunta-9.3'));
        const p9d = this.extractNumericValue(params.get('Pregunta-9.4'));
        const p9e = this.extractNumericValue(params.get('Pregunta-9.5'));
        const p9f = this.extractNumericValue(params.get('Pregunta-9.6'));
        const p9g = this.extractNumericValue(params.get('Pregunta-9.7'));
        const p9h = this.extractNumericValue(params.get('Pregunta-9.8'));
        const p9 = (p9a + p9b + p9c + p9d + p9e + p9f + p9g + p9h) / 8;
        
        const p10 = this.extractNumericValue(params.get('Pregunta-10'));
        
        // p11: suma de checkboxes marcados (p11.1 a p11.5) - opcionales
        const p11_1 = params.get('p11.1-25') ? 25 : 0;
        const p11_2 = params.get('p11.2-25') ? 25 : 0;
        const p11_3 = params.get('p11.3-25') ? 25 : 0;
        const p11_4 = params.get('p11.4-25') ? 25 : 0;
        const p11_5 = params.get('p11.5-25') ? 25 : 0;
        const p11 = p11_1 + p11_2 + p11_3 + p11_4 + p11_5;
        
        
        const p12a = this.extractNumericValue(params.get('Pregunta-12.1'));
        const p12b = this.extractNumericValue(params.get('Pregunta-12.2'));
        const p12c = this.extractNumericValue(params.get('Pregunta-12.3'));
        const p12d = this.extractNumericValue(params.get('Pregunta-12.4'));
        const p12e = this.extractNumericValue(params.get('Pregunta-12.5'));
        const p12f = this.extractNumericValue(params.get('Pregunta-12.6'));
        const p12g = this.extractNumericValue(params.get('Pregunta-12.7'));
        const p12h = this.extractNumericValue(params.get('Pregunta-12.8'));
        const p12 = (p12a + p12b + p12c + p12d + p12e + p12f + p12g + p12h) / 8;
        
        return (p8 + p9 + p10 + p11 + p12) / 5;
    }

    calculateExterno(params) {
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

    async sendToSheets(data) {
        try {
            console.log('📤 Enviando datos a Google Sheets:', data);
            
            // Calcular GSB Index total
            data.gsb_index_total = (data.media_ambiental + data.media_social + data.media_gobernanza) / 3;
            
            console.log('📊 GSB Index calculado:', data.gsb_index_total);
            
            // Usar JSONP directamente (Google Apps Script no soporta CORS correctamente)
            return new Promise((resolve, reject) => {
                    const callbackName = 'gsbCallback_' + Date.now();
                    
                    // Timeout de 15 segundos
                    const timeout = setTimeout(() => {
                        delete window[callbackName];
                        if (script.parentNode) {
                            document.head.removeChild(script);
                        }
                        reject(new Error('Timeout: No se recibió respuesta del servidor'));
                    }, 15000);
                    
                    window[callbackName] = (result) => {
                        clearTimeout(timeout);
                        delete window[callbackName];
                        if (script.parentNode) {
                            document.head.removeChild(script);
                        }
                        console.log('📥 Respuesta recibida de Google Sheets:', result);
                        resolve(result);
                    };
                    
                    const script = document.createElement('script');
                    
                    // Crear URL con datos como parámetros para JSONP
                    const params = new URLSearchParams();
                    params.append('callback', callbackName);
                    
                    // Comprimir datos para evitar URL larga
                    const compressedData = this.compressData(data);
                    params.append('data', compressedData);
                    
                    const url = `${this.SCRIPT_URL}?${params.toString()}`;
                    
                    // Verificar si la URL es demasiado larga
                    if (url.length > 2000) {
                        console.log(`⚠️ URL demasiado larga (${url.length} chars), usando datos esenciales`);
                        this.sendEssentialDataOnly(data, callbackName, resolve, reject);
                        return;
                    }
                    
                    script.src = url;
                    script.onerror = () => {
                        clearTimeout(timeout);
                        delete window[callbackName];
                        if (script.parentNode) {
                            document.head.removeChild(script);
                        }
                        reject(new Error('Error cargando script JSONP'));
                    };
                    
                    document.head.appendChild(script);
            });
            
        } catch (error) {
            console.error('❌ Error enviando datos a Google Sheets:', error);
            throw error;
        }
    }

    // Comprimir datos para reducir el tamaño de la URL
    compressData(data) {
        try {
            // Convertir a JSON
            const jsonString = JSON.stringify(data);
            
            // Calcular el tamaño estimado de la URL completa
            const estimatedUrlLength = this.SCRIPT_URL.length + jsonString.length + 200; // +200 para parámetros adicionales
            
            // Si la URL estimada es mayor a 1500 caracteres, usar base64
            if (estimatedUrlLength > 1500) {
                console.log(`📦 Comprimiendo datos (URL estimada: ${estimatedUrlLength} chars)`);
                return btoa(jsonString);
            }
            
            console.log(`📦 Datos sin comprimir (URL estimada: ${estimatedUrlLength} chars)`);
            return jsonString;
        } catch (error) {
            console.error('Error comprimiendo datos:', error);
            return JSON.stringify(data);
        }
    }
    
    // Verificar si los datos son demasiado grandes para enviar
    isDataTooLarge(data) {
        try {
            const jsonString = JSON.stringify(data);
            const estimatedUrlLength = this.SCRIPT_URL.length + jsonString.length + 200;
            
            // Si la URL estimada es mayor a 2000 caracteres, es demasiado grande
            return estimatedUrlLength > 2000;
        } catch (error) {
            console.error('Error verificando tamaño de datos:', error);
            return true; // En caso de error, asumir que es demasiado grande
        }
    }
    
    // Enviar solo datos esenciales para evitar URL larga
    async sendEssentialDataOnly(data, callbackName, resolve, reject) {
        try {
            console.log('📦 Enviando datos esenciales (URL demasiado larga)');
            
            // En lugar de datos esenciales, enviar TODOS los datos pero comprimidos
            console.log('📦 Comprimiendo datos completos para envío');
            
            // Guardar datos completos en localStorage como respaldo
            this.saveCompleteDataToLocalStorage(data);
            
            // Enviar datos esenciales via JSONP
            const script = document.createElement('script');
            
            // Timeout de 15 segundos
            const timeout = setTimeout(() => {
                delete window[callbackName];
                if (script.parentNode) {
                    document.head.removeChild(script);
                }
                reject(new Error('Timeout: No se recibió respuesta del servidor (datos esenciales)'));
            }, 15000);
            
            window[callbackName] = (result) => {
                clearTimeout(timeout);
                delete window[callbackName];
                if (script.parentNode) {
                    document.head.removeChild(script);
                }
                
                console.log('📥 Respuesta recibida (datos esenciales):', result);
                resolve(result);
            };
            
            const params = new URLSearchParams();
            params.append('callback', callbackName);
            
            // Comprimir TODOS los datos usando base64
            const jsonString = JSON.stringify(data);
            const compressedData = btoa(jsonString);
            params.append('data', compressedData);
            
            const url = `${this.SCRIPT_URL}?${params.toString()}`;
            console.log(`🔗 URL comprimida: ${url.length} caracteres`);
            
            script.src = url;
            script.onerror = () => {
                delete window[callbackName];
                if (script.parentNode) {
                    document.head.removeChild(script);
                }
                reject(new Error('Error enviando datos esenciales'));
            };
            
            document.head.appendChild(script);
            
        } catch (error) {
            console.error('Error enviando datos esenciales:', error);
            reject(error);
        }
    }
    
    // Guardar datos completos en localStorage como respaldo
    saveCompleteDataToLocalStorage(data) {
        try {
            const timestamp = this.getSpanishTimestamp();
            const storageKey = `gsb_data_${timestamp}`;
            
            // Guardar datos con timestamp
            const dataToStore = {
                ...data,
                storedAt: timestamp,
                source: 'form_submission'
            };
            
            localStorage.setItem(storageKey, JSON.stringify(dataToStore));
            
            // Mantener solo los últimos 10 registros
            this.cleanupOldLocalStorageData();
            
            
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    }
    
    // Limpiar datos antiguos de localStorage
    cleanupOldLocalStorageData() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('gsb_data_'));
            
            if (keys.length > 10) {
                // Ordenar por timestamp y eliminar los más antiguos
                keys.sort();
                const keysToRemove = keys.slice(0, keys.length - 10);
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
            }
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    }

    // Método para obtener medias sectoriales específicas por sector y tamaño
    async getSectorialAverages(sector, tamano) {
        try {
            const cacheKey = `${sector}_${tamano}`;
            
            // Verificar cache primero
            if (this.sectorialCache.has(cacheKey)) {
                console.log(`📋 [Sheets] Datos encontrados en cache para ${cacheKey}`);
                return this.sectorialCache.get(cacheKey);
            }
            
            // Verificar si ya hay una request pendiente para esta combinación
            if (this.pendingRequests.has(cacheKey)) {
                console.log(`⏳ [Sheets] Esperando request pendiente para ${cacheKey}`);
                return this.pendingRequests.get(cacheKey);
            }
            
            // Crear nueva request
            const requestPromise = new Promise((resolve, reject) => {
                const callbackName = 'gsbAveragesCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                let script = null;
                
                // Crear un timeout más largo para dar tiempo al callback
                const timeout = setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                    }
                    if (script && script.parentNode) {
                        document.head.removeChild(script);
                    }
                    console.log('⚠️ [Sheets] Timeout en getSectorialAverages, usando datos por defecto');
                    const defaultData = this.getDefaultSectorialAverages(sector, tamano);
                    this.sectorialCache.set(cacheKey, defaultData);
                    this.pendingRequests.delete(cacheKey);
                    resolve(defaultData);
                }, 10000); // Aumentado a 10 segundos
                
                // Definir el callback con una verificación adicional
                window[callbackName] = (result) => {
                    try {
                        clearTimeout(timeout);
                        if (window[callbackName]) {
                            delete window[callbackName];
                        }
                        if (script && script.parentNode) {
                            document.head.removeChild(script);
                        }
                        
                        if (result && result.success) {
                            console.log('✅ [Sheets] Datos recibidos del servidor:', result.result);
                            // Guardar en cache
                            this.sectorialCache.set(cacheKey, result.result);
                            this.pendingRequests.delete(cacheKey);
                            resolve(result.result);
                        } else {
                            console.log('⚠️ [Sheets] Error en respuesta del servidor, usando datos por defecto');
                            const defaultData = this.getDefaultSectorialAverages(sector, tamano);
                            this.sectorialCache.set(cacheKey, defaultData);
                            this.pendingRequests.delete(cacheKey);
                            resolve(defaultData);
                        }
                    } catch (error) {
                        console.error('❌ [Sheets] Error procesando callback:', error);
                        const defaultData = this.getDefaultSectorialAverages(sector, tamano);
                        this.sectorialCache.set(cacheKey, defaultData);
                        this.pendingRequests.delete(cacheKey);
                        resolve(defaultData);
                    }
                };
                
                // Esperar un momento antes de cargar el script para asegurar que el callback esté definido
                setTimeout(() => {
                    script = document.createElement('script');
                    const params = new URLSearchParams();
                    params.append('callback', callbackName);
                    params.append('action', 'getAverages');
                    params.append('sector', sector);
                    params.append('tamano', tamano);
                    
                    const url = `${this.SCRIPT_URL}?${params.toString()}`;
                    console.log(`🔗 [Sheets] Intentando conectar con: ${url}`);
                    script.src = url;
                    
                    script.onerror = () => {
                        clearTimeout(timeout);
                        if (window[callbackName]) {
                            delete window[callbackName];
                        }
                        if (script && script.parentNode) {
                            document.head.removeChild(script);
                        }
                        console.log('⚠️ [Sheets] Error cargando script JSONP, usando datos por defecto');
                        const defaultData = this.getDefaultSectorialAverages(sector, tamano);
                        this.sectorialCache.set(cacheKey, defaultData);
                        this.pendingRequests.delete(cacheKey);
                        resolve(defaultData);
                    };
                    
                    script.onload = () => {
                        console.log('📡 [Sheets] Script cargado correctamente');
                    };
                    
                    document.head.appendChild(script);
                }, 200); // Aumentado el delay para evitar conflictos
            });
            
            // Guardar la request pendiente
            this.pendingRequests.set(cacheKey, requestPromise);
            
            return requestPromise;
        } catch (error) {
            console.error('❌ [Sheets] Error en getSectorialAverages:', error);
            console.log('📊 [Sheets] Usando datos por defecto como fallback');
            return this.getDefaultSectorialAverages(sector, tamano);
        }
    }

    // Método para obtener medias sectoriales por defecto
    getDefaultSectorialAverages(sector, tamano) {
        console.log(`📊 [Sheets] Generando medias por defecto para ${tamano} - ${sector}`);
        
        // Medias por defecto basadas en los valores originales
        return {
            success: true,
            tamano: tamano,
            sector: sector,
            media_ambiental: 0, // Valor placeholder - datos no disponibles
            media_social: 0,   // Valor placeholder - datos no disponibles
            media_gobernanza: 0, // Valor placeholder - datos no disponibles
            gsb_index_total: 0, // Valor placeholder - datos no disponibles
            impacto_climatico: 0, // Valor placeholder - datos no disponibles
            gestion_sostenible: 0, // Valor placeholder - datos no disponibles
            biodiversidad: 0,  // Valor placeholder - datos no disponibles
            gestion_ambiental: 0, // Valor placeholder - datos no disponibles
            interno: 0,        // Valor placeholder - datos no disponibles
            externo: 0,        // Valor placeholder - datos no disponibles
            estrategia_empresarial: 0, // Valor placeholder - datos no disponibles
            eco_financiero: 0,         // Valor placeholder - datos no disponibles
            proveedores: 0,            // Valor placeholder - datos no disponibles
            codigo_etico: 0,           // Valor placeholder - datos no disponibles
        };
    }

    // Método para sincronizar datos calculados con las gráficas
    syncWithGraphics() {
        console.log('🔄 [Sheets] Sincronizando datos con gráficas...');
        
        // Disparar evento para que las gráficas se actualicen
        const syncEvent = new CustomEvent('gsbDataSync', {
            detail: {
                source: 'sheets',
                timestamp: this.getSpanishTimestamp()
            }
        });
        window.dispatchEvent(syncEvent);
        console.log('✅ [Sheets] Evento de sincronización disparado');
    }
}

// Inicializar automáticamente
console.log('📦 Creando instancia global de GSBSheetsIntegration...');
const gsbSheets = new GSBSheetsIntegration();

// Exportar para uso global
window.gsbSheets = gsbSheets;
console.log('✅ Instancia global creada y asignada a window.gsbSheets');

// Exportar para uso manual si es necesario
window.GSBSheetsIntegration = GSBSheetsIntegration;
