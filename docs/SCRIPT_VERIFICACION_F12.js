// =====================================================
// SCRIPT DE VERIFICACIÓN COMPLETA - APIS IA
// =====================================================
// Copia y pega TODO este código en la consola del navegador (F12)
// =====================================================

(async function verificarAPIs() {
  console.log('%c🔍 INICIANDO VERIFICACIÓN DE APIS IA...', 'font-size: 16px; font-weight: bold; color: #1C8FA0;');
  console.log('');
  
  // 1. Verificar variables de entorno
  console.log('%c📋 1. VERIFICANDO VARIABLES DE ENTORNO:', 'font-weight: bold;');
  const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const qwenKey = import.meta.env.VITE_QWEN_API_KEY;
  
  const deepseekStatus = deepseekKey && deepseekKey !== 'sk-4d4cc3ac92254985b045a1881b85b12a';
  const qwenStatus = qwenKey && qwenKey !== 'sk-e6343f5b0abc42d294d2ad7f977e48e8';
  
  console.log('   DeepSeek Key:', deepseekStatus ? 
    `%c✅ Configurada (${deepseekKey.substring(0, 15)}...)` : 
    '%c❌ NO CONFIGURADA o usando valor por defecto', 
    deepseekStatus ? 'color: green;' : 'color: red;');
  console.log('   Qwen Key:', qwenStatus ? 
    `%c✅ Configurada (${qwenKey.substring(0, 15)}...)` : 
    '%c❌ NO CONFIGURADA o usando valor por defecto', 
    qwenStatus ? 'color: green;' : 'color: red;');
  
  if (!deepseekStatus && !qwenStatus) {
    console.error('\n%c❌ ERROR: Ninguna API key válida está configurada.', 'color: red; font-weight: bold;');
    console.log('\n%c📝 SOLUCIÓN:', 'font-weight: bold;');
    console.log('   1. Crea un archivo .env en la raíz del proyecto');
    console.log('   2. Agrega las siguientes líneas:');
    console.log('      VITE_DEEPSEEK_API_KEY=sk-tu-api-key-aqui');
    console.log('      VITE_QWEN_API_KEY=sk-tu-api-key-aqui');
    console.log('   3. Reinicia el servidor de desarrollo (npm run dev)');
    console.log('   4. Recarga esta página');
    return;
  }
  
  // 2. Verificar importación del módulo
  console.log('\n%c📦 2. VERIFICANDO IMPORTACIÓN DEL MÓDULO:', 'font-weight: bold;');
  let module, ai;
  try {
    module = await import('/src/lib/deepfinance/aiService.js');
    console.log('   %c✅ Módulo importado correctamente', 'color: green;');
    console.log('   Exportaciones disponibles:', Object.keys(module));
    
    // Verificar que DeepFinanceAIService existe
    if (!module.DeepFinanceAIService) {
      console.error('   %c❌ DeepFinanceAIService no encontrado en el módulo', 'color: red;');
      return;
    }
    console.log('   %c✅ DeepFinanceAIService encontrado', 'color: green;');
    
    // 3. Crear instancia
    console.log('\n%c🔧 3. CREANDO INSTANCIA:', 'font-weight: bold;');
    ai = new module.DeepFinanceAIService();
    console.log('   %c✅ Instancia creada correctamente', 'color: green;');
    
    // 4. Probar llamada a DeepSeek
    console.log('\n%c🚀 4. PROBANDO LLAMADA A DEEPSEEK:', 'font-weight: bold;');
    console.log('   Enviando mensaje de prueba...');
    
    const startTime = Date.now();
    try {
      const response = await Promise.race([
        ai.callAI("Hola, esta es una prueba de conexión. Responde solo con 'OK' si me escuchas."),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La llamada tardó más de 30 segundos')), 30000)
        )
      ]);
      
      const duration = Date.now() - startTime;
      console.log(`   %c✅ Respuesta recibida en ${duration}ms`, 'color: green;');
      console.log('   📝 Respuesta:', response);
      
      if (response && response.length > 0) {
        console.log('\n%c✅ ✅ ✅ PRUEBA EXITOSA - DEEPSEEK FUNCIONA CORRECTAMENTE', 'color: green; font-size: 14px; font-weight: bold;');
      } else {
        console.warn('\n%c⚠️ Respuesta vacía recibida', 'color: orange;');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`   %c❌ Error después de ${duration}ms`, 'color: red;');
      console.error('   Mensaje:', error.message);
      
      // Diagnóstico de errores comunes
      console.log('\n%c🔍 DIAGNÓSTICO:', 'font-weight: bold;');
      if (error.message.includes('Timeout')) {
        console.log('   %c⚠️ La API no respondió a tiempo', 'color: orange;');
        console.log('   Posibles causas:');
        console.log('   - API key inválida o expirada');
        console.log('   - Problemas de red');
        console.log('   - Rate limit alcanzado');
      } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.log('   %c⚠️ Error de red', 'color: orange;');
        console.log('   Posibles causas:');
        console.log('   - Sin conexión a internet');
        console.log('   - CORS bloqueado');
        console.log('   - URL de API incorrecta');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('   %c⚠️ Error de autenticación', 'color: orange;');
        console.log('   Posibles causas:');
        console.log('   - API key inválida');
        console.log('   - API key expirada');
        console.log('   - API key no tiene permisos');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('   %c⚠️ Acceso prohibido', 'color: orange;');
        console.log('   Posibles causas:');
        console.log('   - API key no tiene permisos');
        console.log('   - Cuenta suspendida');
      } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        console.log('   %c⚠️ Rate limit alcanzado', 'color: orange;');
        console.log('   Solución: Espera unos minutos y vuelve a intentar');
      }
      
      // Si DeepSeek falla, probar Qwen
      if (qwenStatus) {
        console.log('\n%c🔄 Intentando con Qwen como fallback...', 'font-weight: bold;');
        try {
          const qwenStartTime = Date.now();
          const qwenResponse = await Promise.race([
            ai.callAI("Hola, esta es una prueba de conexión. Responde solo con 'OK' si me escuchas."),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout: La llamada tardó más de 30 segundos')), 30000)
            )
          ]);
          const qwenDuration = Date.now() - qwenStartTime;
          console.log(`   %c✅ Qwen respondió en ${qwenDuration}ms`, 'color: green;');
          console.log('   📝 Respuesta:', qwenResponse);
        } catch (qwenError) {
          console.error('   %c❌ Qwen también falló:', 'color: red;', qwenError.message);
        }
      }
    }
    
    // 5. Verificar métodos disponibles
    console.log('\n%c📚 5. MÉTODOS DISPONIBLES:', 'font-weight: bold;');
    const methods = [
      'callAI',
      'generateAIInsights',
      'buildAnalysisContext',
      'buildAnalysisPrompt',
      'parseAIResponse'
    ];
    methods.forEach(method => {
      const exists = typeof ai[method] === 'function';
      console.log(`   ${method}:`, exists ? '%c✅' : '%c❌', exists ? 'color: green;' : 'color: red;');
    });
    
    console.log('\n%c✅ VERIFICACIÓN COMPLETA', 'color: green; font-weight: bold;');
    
  } catch (error) {
    console.error('\n%c❌ ERROR CRÍTICO:', 'color: red; font-weight: bold;', error);
    console.error('   Stack:', error.stack);
  }
})();

