# 📋 INSTRUCCIONES PASO A PASO - FUTURE SELF SIMULATOR

## 🎯 OBJETIVO

Implementar el módulo "Future Self Simulator" en tu aplicación FINANTEL para que los usuarios puedan ver proyecciones de su futuro financiero.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: BASE DE DATOS (SQL)

- [ ] **Paso 1.1:** Ir a Supabase Dashboard
  - URL: https://supabase.com/dashboard
  - Selecciona tu proyecto

- [ ] **Paso 1.2:** Abrir SQL Editor
  - Menú lateral → SQL Editor
  - Click en "New query"

- [ ] **Paso 1.3:** Aplicar Migración
  - Abre el archivo: `supabase/migrations/044_future_self_simulator.sql`
  - Copia TODO el contenido (Ctrl+A, Ctrl+C)
  - Pega en el SQL Editor de Supabase
  - Click en "Run" o presiona Ctrl+Enter
  - **Verificar:** Debe aparecer "Success. No rows returned"

- [ ] **Paso 1.4:** Verificar Tablas Creadas
  - En Supabase Dashboard → Table Editor
  - Debes ver 2 nuevas tablas:
    - `future_self_scenarios`
    - `future_self_simulation_history`

---

### FASE 2: EDGE FUNCTION

- [ ] **Paso 2.1:** Verificar Supabase CLI
  ```bash
  supabase --version
  ```
  - Si no está instalado, sigue: `INSTALAR_SUPABASE.md`

- [ ] **Paso 2.2:** Enlazar Proyecto (si no lo has hecho)
  ```bash
  supabase login
  supabase link --project-ref TU_PROJECT_REF
  ```
  - Obtén PROJECT_REF desde: Dashboard → Settings → General

- [ ] **Paso 2.3:** Desplegar Edge Function
  ```bash
  supabase functions deploy future-self-simulator
  ```
  - **Verificar:** Debe aparecer "Deployed function future-self-simulator"

- [ ] **Paso 2.4:** Verificar en Dashboard
  - Ve a: Supabase Dashboard → Edge Functions
  - Debes ver `future-self-simulator` en la lista
  - Status debe ser "Active"

---

### FASE 3: CONFIGURACIÓN OPCIONAL (IA)

- [ ] **Paso 3.1:** Configurar API Keys (Opcional)
  - Ve a: Supabase Dashboard → Settings → Edge Functions → Secrets
  - Agrega las siguientes variables (si quieres usar IA):
    ```
    DEEPSEEK_API_KEY=sk-xxxxx
    QWEN_API_KEY=sk-xxxxx (opcional)
    OPENAI_API_KEY=sk-xxxxx (opcional)
    ```
  - **Nota:** Si no configuras estas keys, el sistema funcionará con resúmenes por defecto (sin IA)

- [ ] **Paso 3.2:** Obtener API Keys
  - **DeepSeek:** https://platform.deepseek.com/api_keys
  - **Qwen (Alibaba):** https://dashscope.aliyuncs.com/
  - **OpenAI:** https://platform.openai.com/api-keys

---

### FASE 4: VERIFICACIÓN EN LA APLICACIÓN

- [ ] **Paso 4.1:** Iniciar Servidor de Desarrollo
  ```bash
  npm run dev
  ```

- [ ] **Paso 4.2:** Iniciar Sesión
  - Abre: http://localhost:3000
  - Inicia sesión con tu cuenta

- [ ] **Paso 4.3:** Navegar a Simulador de Futuro
  - En el Sidebar, busca "Simulador de Futuro" (icono TrendingUp)
  - O ve directamente a: http://localhost:3000/dashboard/future-self

- [ ] **Paso 4.4:** Verificar Funcionamiento
  - Debe aparecer selector de horizonte (3, 6, 12, 24 meses)
  - Debe mostrar 3 cards de escenarios (si tienes datos)
  - Debe mostrar métricas actuales

- [ ] **Paso 4.5:** Probar Cálculo
  - Selecciona un horizonte (ej: 12 meses)
  - Si no hay datos, debe mostrar: "No hay datos suficientes"
  - Si hay datos, debe calcular los 3 escenarios

---

### FASE 5: TESTING COMPLETO

- [ ] **Paso 5.1:** Probar con Usuario con Datos
  - Asegúrate de tener al menos 3 meses de transacciones
  - Ve a Simulador de Futuro
  - Verifica que se calculen los 3 escenarios

- [ ] **Paso 5.2:** Probar Cambio de Horizonte
  - Cambia entre 3, 6, 12, 24 meses
  - Verifica que los escenarios se actualicen

- [ ] **Paso 5.3:** Probar Botón "Recalcular"
  - Click en "Recalcular"
  - Debe forzar nuevo cálculo (puede tardar unos segundos)

- [ ] **Paso 5.4:** Verificar en Base de Datos
  ```sql
  SELECT * FROM future_self_scenarios 
  WHERE user_id = 'TU_USER_ID'
  ORDER BY horizon_months, scenario_type;
  ```
  - Debe haber 12 registros (3 escenarios × 4 horizontes)

---

## 🔍 VERIFICACIÓN DE ERRORES

### Si la migración SQL falla:

1. **Error: "relation already exists"**
   - Las tablas ya existen
   - Verifica en Table Editor si están creadas
   - Si están, continúa al siguiente paso

2. **Error: "function already exists"**
   - Las funciones ya existen
   - Puedes continuar, no es crítico

3. **Error de permisos**
   - Asegúrate de estar usando el SQL Editor con permisos de administrador
   - O usa el Service Role Key

### Si la Edge Function no se despliega:

1. **Error: "Not linked to a project"**
   ```bash
   supabase link --project-ref TU_PROJECT_REF
   ```

2. **Error: "Function not found"**
   - Verifica que el archivo existe en: `supabase/functions/future-self-simulator/index.ts`

3. **Error de compilación**
   - Revisa los logs: `supabase functions logs future-self-simulator`
   - Verifica que no haya errores de sintaxis

### Si no aparece en la aplicación:

1. **No aparece el enlace en Sidebar**
   - Verifica que `src/components/Sidebar.jsx` tiene el enlace
   - Busca: "Simulador de Futuro"

2. **Error 404 al navegar**
   - Verifica que `src/App.jsx` tiene la ruta
   - Busca: `path="future-self"`

3. **Error al cargar datos**
   - Abre la consola del navegador (F12)
   - Revisa errores en la pestaña "Console"
   - Verifica que la Edge Function está desplegada

---

## 📊 VERIFICAR EN PRODUCCIÓN

### Después de desplegar:

1. **Verificar Migración en Producción**
   - Aplica la migración SQL en tu proyecto de producción
   - O usa: `supabase db push --db-url TU_DB_URL`

2. **Desplegar Edge Function en Producción**
   ```bash
   supabase functions deploy future-self-simulator --project-ref TU_PROJECT_REF
   ```

3. **Configurar Secrets en Producción**
   - Ve a Dashboard de producción
   - Configura las API keys (si usas IA)

4. **Probar en Producción**
   - Inicia sesión en la app de producción
   - Navega a Simulador de Futuro
   - Verifica que funciona correctamente

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE IMPLEMENTAR

1. **Monitorear Uso**
   - Revisa cuántos usuarios usan el simulador
   - Analiza qué horizontes son más populares

2. **Mejorar Prompts de IA**
   - Ajusta los prompts según feedback de usuarios
   - Prueba diferentes modelos de IA

3. **Agregar Funcionalidades**
   - Comparación con realidad (cuando se alcanza el horizonte)
   - Escenarios personalizados
   - Gráficos de evolución

4. **Optimizar Performance**
   - Revisa tiempos de respuesta
   - Optimiza cache si es necesario

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisa los logs:**
   ```bash
   supabase functions logs future-self-simulator
   ```

2. **Verifica la BD:**
   ```sql
   SELECT * FROM future_self_scenarios LIMIT 5;
   ```

3. **Revisa la consola del navegador:**
   - F12 → Console
   - Busca errores en rojo

4. **Consulta la documentación:**
   - `FUTURE-SELF-SIMULATOR-README.md`
   - `PROMPTS-FUTURE-SELF-AI.md`

---

## ✅ CHECKLIST FINAL

Antes de considerar completado:

- [ ] Migración SQL aplicada sin errores
- [ ] Edge Function desplegada y activa
- [ ] Ruta `/dashboard/future-self` funciona
- [ ] Enlace en Sidebar visible
- [ ] Se calculan los 3 escenarios correctamente
- [ ] Resúmenes se generan (con IA o por defecto)
- [ ] Cambio de horizonte funciona
- [ ] Botón "Recalcular" funciona
- [ ] No hay errores en consola del navegador
- [ ] UI se ve bien en móvil y desktop

---

**Versión:** 1.0  
**Fecha:** 2025-01-15  
**Tiempo estimado:** 15-30 minutos

