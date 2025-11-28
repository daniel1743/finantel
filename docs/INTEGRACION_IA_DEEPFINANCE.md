# 🤖 INTEGRACIÓN IA: DeepFinance Engine con DeepSeek/Qwen

## ✅ IMPLEMENTADO

La integración con IA está **COMPLETA** y funcional en la Fase 1.

---

## 🔗 CÓMO FUNCIONA

### Flujo de Integración

```
1. Motor recolecta datos REALES
   │
   ▼
2. Motor hace análisis matemático
   │
   ▼
3. Motor genera recomendaciones básicas
   │
   ▼
4. AIService construye contexto con datos REALES
   │
   ▼
5. AIService llama a DeepSeek API
   │
   ├─ ✅ Éxito → Genera insights profesionales
   │
   └─ ❌ Falla → Intenta con Qwen
       │
       ├─ ✅ Éxito → Genera insights profesionales
       │
       └─ ❌ Falla → Usa fallback básico
```

---

## 📋 ARCHIVO IMPLEMENTADO

### `src/lib/deepfinance/aiService.js`

**Funciones principales:**

1. **`generateAIInsights(analysis, rawData)`**
   - Función principal que genera insights
   - Recibe análisis completo y datos originales
   - Retorna insights estructurados

2. **`callAI(prompt)`**
   - Intenta DeepSeek primero
   - Si falla, intenta Qwen
   - Retorna respuesta de texto

3. **`buildAnalysisContext(analysis, rawData)`**
   - Construye contexto JSON con datos REALES
   - Incluye: puntaje, patrones, riesgo, categorías, etc.
   - NUNCA inventa datos

4. **`buildAnalysisPrompt(context, analysis)`**
   - Construye prompt especializado
   - Incluye reglas críticas de ética
   - PROHÍBE inventar datos explícitamente

5. **`parseAIResponse(aiResponse, analysis)`**
   - Parsea respuesta de la IA
   - Extrae JSON estructurado
   - Maneja errores gracefully

---

## 🎯 PROMPT ESPECIALIZADO

El prompt del DeepFinance Engine es diferente al del Coach Financiero:

### Diferencias Clave:

1. **Tono más profesional:**
   - Asesor financiero ejecutivo (vs. coach-amigo)
   - Análisis objetivo y preciso
   - Lenguaje financiero profesional

2. **Enfoque en análisis:**
   - Diagnóstico por área
   - Identificación de riesgos
   - Recomendaciones accionables
   - Plan de acción estructurado

3. **Formato estructurado:**
   - Respuesta en JSON
   - Campos específicos: summary, diagnosis, recommendations, actionPlan
   - Más formal y organizado

4. **Mismas reglas éticas:**
   - PROHÍBE inventar datos
   - SOLO usa datos reales proporcionados
   - Honestidad cuando no hay datos

---

## 📊 ESTRUCTURA DE RESPUESTA DE IA

La IA genera un JSON estructurado:

```json
{
  "summary": "Resumen ejecutivo de 2-3 oraciones",
  "diagnosis": {
    "strengths": ["Fortaleza 1", "Fortaleza 2"],
    "weaknesses": ["Debilidad 1", "Debilidad 2"],
    "byComponent": {
      "budgetCompliance": "Análisis detallado...",
      "savingsRate": "Análisis detallado...",
      "spendingDiscipline": "Análisis detallado...",
      "riskLevel": "Análisis detallado...",
      "patternHealth": "Análisis detallado...",
      "goalProgress": "Análisis detallado...",
      "emotionalControl": "Análisis detallado..."
    }
  },
  "patterns": "Análisis de patrones detectados",
  "risks": ["Riesgo 1", "Riesgo 2"],
  "recommendations": [
    {
      "title": "Título",
      "description": "Descripción detallada",
      "impact": "alto|medio|bajo",
      "priority": 1-5
    }
  ],
  "actionPlan": {
    "7days": ["Acción 1", "Acción 2"],
    "30days": ["Acción 1", "Acción 2"],
    "90days": ["Acción 1", "Acción 2"]
  }
}
```

---

## 🔒 SEGURIDAD Y ÉTICA

### Reglas Implementadas en el Prompt:

1. **PROHIBIDO ABSOLUTO:**
   - Inventar datos financieros
   - Usar aproximaciones con números no verificables
   - Asumir información no proporcionada

2. **SOLO DATOS REALES:**
   - Todos los números vienen de los datos
   - Si no hay datos, decir "No hay datos suficientes"
   - Ser honesto cuando falte información

3. **Validación Post-IA:**
   - El motor valida que los insights son razonables
   - Si la IA falla, usa fallback básico
   - Nunca se muestra información inventada al usuario

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno Requeridas:

```env
VITE_DEEPSEEK_API_KEY=sk-...
VITE_QWEN_API_KEY=sk-...  # Opcional, solo como fallback
```

### Modelos Usados:

- **DeepSeek:** `deepseek-chat`
- **Qwen:** `qwen-turbo`
- **Temperature:** `0.7` (más conservador para análisis financiero)

---

## 🧪 CÓMO PROBAR

### 1. Verificar que las API Keys estén configuradas

```javascript
// En consola del navegador
console.log('DeepSeek Key:', import.meta.env.VITE_DEEPSEEK_API_KEY ? '✅ Configurada' : '❌ Faltante');
console.log('Qwen Key:', import.meta.env.VITE_QWEN_API_KEY ? '✅ Configurada' : '❌ Faltante');
```

### 2. Ejecutar análisis

```javascript
import { useDeepFinance } from '@/hooks/useDeepFinance';

const { runAnalysis } = useDeepFinance(userId);
const result = await runAnalysis('90days');

// Ver insights de IA
console.log('AI Insights:', result.aiInsights);
console.log('Summary:', result.summary);
console.log('Recommendations:', result.recommendations);
```

### 3. Verificar respuesta

La respuesta debe incluir:
- ✅ `aiInsights` con estructura JSON
- ✅ `summary` generado por IA
- ✅ `recommendations` basadas en datos reales
- ✅ `actionPlan` con pasos concretos

---

## 🐛 TROUBLESHOOTING

### Problema: "No se pudo conectar con los servicios de IA"

**Causas posibles:**
1. API Key no configurada
2. API Key inválida
3. Sin conexión a internet
4. Rate limit alcanzado

**Solución:**
- Verificar variables de entorno
- El sistema usa fallback automático si falla
- Los insights básicos se generan sin IA

### Problema: La IA inventa datos

**Solución:**
- El prompt PROHÍBE explícitamente inventar
- Si ocurre, reportar como bug
- El sistema valida datos antes de mostrar

---

## 📝 NOTAS

- ✅ La integración está **COMPLETA** en Fase 1
- ✅ Usa DeepSeek como principal (más potente)
- ✅ Qwen como fallback automático
- ✅ Prompt especializado para análisis financiero
- ✅ PROHÍBE inventar datos
- ✅ Fallback si fallan ambas APIs

---

**Estado:** ✅ INTEGRACIÓN COMPLETA
**Próximo:** Fase 2 (Análisis Avanzado + UI)

