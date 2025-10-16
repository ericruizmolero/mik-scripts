(function () {
    // Limpiar parámetros de la URL una vez procesados todos los datos
    // Esto se ejecuta después de que todos los scripts de cálculo hayan terminado
    
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', limpiarURL);
    } else {
        // Si ya está cargado, ejecutar inmediatamente
        limpiarURL();
    }
    
    function limpiarURL() {
        // Esperar un poco más para asegurar que todos los scripts han terminado
        setTimeout(function() {
            // Limpiar la URL sin recargar la página
            if (window.history && window.history.replaceState) {
                // Obtener la URL actual sin parámetros
                const urlSinParams = window.location.pathname;
                
                // Reemplazar la URL actual con la versión sin parámetros
                window.history.replaceState(
                    {}, 
                    document.title, 
                    urlSinParams
                );
                
                console.log('Parámetros de URL limpiados correctamente');
            } else {
                console.warn('window.history.replaceState no está disponible');
            }
        }, 1000); // Esperar 1 segundo para asegurar que todos los cálculos han terminado
    }
    
})();
