# 🎤 GUÍA COMPLETA: Sistema de Voz con Moneda y Necesidad

## 🎯 PROBLEMA RESUELTO

Ya no más confusiones entre "$50" y "$50,000". Ahora el sistema:
- ✅ Detecta correctamente "50 mil" = $50,000 (NO $50.00)
- ✅ Usa la moneda configurada en tu perfil (CLP, COP, USD, etc.)
- ✅ Clasifica automáticamente el nivel de necesidad
- ✅ Extrae bien la descripción: "Zapatos 60 mil" → Descripción: "Zapatos"

---

## 📋 PASOS PARA ACTUALIZAR (10 MINUTOS)

### PASO 1: Ejecutar migración de base de datos

#### 1.1 Ve a Supabase Dashboard - SQL Editor

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/sql/new
```

#### 1.2 Ejecuta esta migración:

Abre el archivo:
```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\supabase\migrations\025_add_necessity_level.sql
```

Copia TODO el contenido y pégalo en el SQL Editor de Supabase, luego presiona **"Run"**.

Deberías ver: ✅ **"Success. No rows returned"**

---

### PASO 2: Actualizar la Edge Function

#### 2.1 Abre el nuevo código

```
C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\CODIGO-VOICE-COMPLETO-CON-MONEDA.ts
```

#### 2.2 Copia TODO el código (`Ctrl + A`, `Ctrl + C`)

#### 2.3 Ve a Supabase Functions

```
https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions
```

#### 2.4 Edita `voice-to-transaction`

1. Click en `voice-to-transaction`
2. Selecciona todo el código (`Ctrl + A`)
3. Bórralo (`Delete`)
4. Pega el nuevo (`Ctrl + V`)
5. Click en **"Deploy"**
6. Espera 30-60 segundos

---

### PASO 3: Configurar tu moneda (IMPORTANTE)

#### 3.1 Abre la aplicación

```
http://localhost:3001
```

#### 3.2 Ve a tu perfil

- Click en tu avatar (arriba derecha)
- O ve directamente a: `http://localhost:3001/dashboard/profile`

#### 3.3 Configura tu moneda

1. Busca la sección **"Preferencias"**
2. Click en **"Moneda Principal"**
3. Selecciona tu moneda:
   - 🇨🇱 **Peso Chileno (CLP)** - para Chile
   - 🇨🇴 **Peso Colombiano (COP)** - para Colombia
   - 🇺🇸 **Dólar (USD)** - para USA
   - 🇲🇽 **Peso Mexicano (MXN)** - para México
   - 🇦🇷 **Peso Argentino (ARS)** - para Argentina
   - Etc.
4. Click en **"Guardar Cambios"**

**⚠️ MUY IMPORTANTE:** Sin configurar esto, el sistema no sabrá si "50 mil" son $50,000 CLP o $50,000 USD.

---

### PASO 4: Reemplazar VoiceInput (Opcional pero recomendado)

Si quieres la guía visual mejorada:

#### 4.1 Haz backup del actual

```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional\src\components"
copy VoiceInput.jsx VoiceInput.jsx.backup
```

#### 4.2 Reemplaza el archivo

```bash
copy VoiceInputMejorado.jsx VoiceInput.jsx
```

O manualmente:
1. Abre `VoiceInputMejorado.jsx`
2. Copia todo el contenido
3. Reemplaza el contenido de `VoiceInput.jsx`

---

### PASO 5: Reiniciar y probar

#### 5.1 Reinicia el servidor

```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
npm run dev
```

#### 5.2 Abre la app

```
http://localhost:3001/dashboard/transactions
```

#### 5.3 Recarga la página

Presiona `Ctrl + Shift + R` (hard refresh)

---

## 🎤 CÓMO USAR EL MICRÓFONO

### Formato básico:

```
[Descripción] + [Monto] + [Necesidad (opcional)]
```

### ✅ Ejemplos correctos:

| Di esto | Resultado esperado |
|---------|-------------------|
| "Comida 50 mil pesos" | $50,000 • Comida • Alimentación • Esencial |
| "Zapatos 60 mil" | $60,000 • Zapatos • Ropa • Opcional |
| "Uber 15 mil necesario" | $15,000 • Uber • Transporte • Esencial |
| "Pizza 20k opcional" | $20,000 • Pizza • Restaurantes • Opcional |
| "Farmacia mil pesos esencial" | $1,000 • Farmacia • Salud • Esencial |
| "Gasté 30 mil en Jumbo" | $30,000 • Jumbo • Alimentación • Esencial |

### 💰 Formatos de monto aceptados:

| Dices | Se guarda como |
|-------|----------------|
| "50 mil" | $50,000 |
| "50 mil pesos" | $50,000 |
| "50k" | $50,000 |
| "mil pesos" | $1,000 |
| "5000" | $5,000 |
| "cincuenta mil" | $50,000 |

### 🎯 Niveles de necesidad:

| Dices | Se clasifica como |
|-------|-------------------|
| "necesario", "esencial", "urgente" | ✅ Esencial (verde) |
| "importante" | ⚠️ Importante (amarillo) |
| "opcional", "lujo" | 💎 Opcional (azul) |
| (Nada) | 🤖 Automático según categoría |

---

## 🤖 CLASIFICACIÓN AUTOMÁTICA

### Categorías Esenciales:
- **Alimentación**: Jumbo, Líder, comida, supermercado
- **Salud**: Farmacia, doctor, medicamentos
- **Servicios**: Luz, agua, gas, arriendo

### Categorías Importantes:
- **Transporte**: Uber, Metro, combustible
- **Educación**: Colegio, libros, universidad

### Categorías Opcionales:
- **Restaurantes**: McDonald's, Starbucks, pizza
- **Ropa**: Zapatos, zapatillas, ropa
- **Entretenimiento**: Cine, Netflix, Spotify

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema 1: "Digo 50 mil y se guarda $50.00"

**Causa:** La Edge Function vieja no está actualizada

**Solución:**
1. Ve al PASO 2 de esta guía
2. Asegúrate de haber desplegado `CODIGO-VOICE-COMPLETO-CON-MONEDA.ts`
3. Verifica en los logs de Supabase que diga: `✅ Monto detectado (mil): 50000`

### Problema 2: "La moneda no es correcta"

**Causa:** No has configurado tu moneda en el perfil

**Solución:**
1. Ve a tu perfil: `http://localhost:3001/dashboard/profile`
2. Click en "Moneda Principal"
3. Selecciona tu moneda (CLP, COP, USD, etc.)
4. Guarda cambios
5. Reinicia la app

### Problema 3: "No detecta la categoría"

**Causa:** La categoría no existe en tu base de datos

**Solución:**
1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/editor
2. Abre la tabla `categories`
3. Verifica que existan estas categorías para tu usuario:
   - Alimentación
   - Transporte
   - Salud
   - Ropa y Calzado
   - Restaurantes
   - Otros (MUY IMPORTANTE como fallback)

**Crear categorías faltantes:**
```sql
INSERT INTO categories (user_id, name, icon, color, type) VALUES
  ('tu-user-id', 'Alimentación', '🍔', '#4CAF50', 'expense'),
  ('tu-user-id', 'Transporte', '🚗', '#2196F3', 'expense'),
  ('tu-user-id', 'Salud', '🏥', '#F44336', 'expense'),
  ('tu-user-id', 'Ropa y Calzado', '👕', '#E91E63', 'expense'),
  ('tu-user-id', 'Restaurantes', '🍕', '#FF9800', 'expense'),
  ('tu-user-id', 'Otros', '📦', '#9E9E9E', 'expense');
```

Reemplaza `'tu-user-id'` con tu UUID real.

### Problema 4: "No aparece el campo de necesidad"

**Causa:** La migración no se ejecutó

**Solución:**
1. Ve al PASO 1 de esta guía
2. Ejecuta la migración `025_add_necessity_level.sql`
3. Verifica que se haya creado:
```sql
SELECT necessity_level, COUNT(*)
FROM transactions
GROUP BY necessity_level;
```

---

## 📊 VERIFICAR QUE TODO FUNCIONA

### Test 1: Revisar los logs

1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/functions/voice-to-transaction
2. Click en **"Logs"**
3. Haz una prueba del micrófono
4. Deberías ver:

```
✅ Audio recibido: xxxxx bytes
✅ UserId: [tu-id]
💰 Moneda del usuario: CLP
🎤 Transcribiendo...
✅ Transcripción: Comida 50 mil pesos
🔍 Parseando: Comida 50 mil pesos
✅ Monto detectado (mil): 50000 CLP
✅ Descripción detectada: Comida
✅ Categoría detectada: Alimentación (keyword: comida)
✅ Necesidad automática: essential
🔍 Buscando categoría: Alimentación
✅ Categoría encontrada: Alimentación → [id]
💾 Insertando transacción: {...}
✅ Transacción creada: [id]
```

### Test 2: Revisar en la base de datos

1. Ve a: https://supabase.com/dashboard/project/yzakmqxbzwzbsdsadzej/editor
2. Abre la tabla `transactions`
3. Ordena por `created_at` descendente
4. La última transacción debería tener:

```json
{
  "amount": 50000,
  "description": "Comida",
  "currency": "CLP",
  "necessity_level": "essential",
  "category_id": "[id de Alimentación]",
  "metadata": {
    "created_via": "voice",
    "transcript": "Comida 50 mil pesos",
    "parsed_category": "Alimentación",
    "transcription_service": "openai-whisper"
  }
}
```

---

## ✅ CHECKLIST COMPLETO

### Base de Datos
- [ ] Migración `025_add_necessity_level.sql` ejecutada
- [ ] Campo `necessity_level` existe en tabla `transactions`
- [ ] Tabla `profile_preferences` tiene campo `currency`

### Edge Function
- [ ] Código `CODIGO-VOICE-COMPLETO-CON-MONEDA.ts` copiado
- [ ] Función `voice-to-transaction` actualizada en Supabase
- [ ] Deployment exitoso (estado "Active")
- [ ] Secretos configurados:
  - [ ] `OPENAI_API_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Configuración de Usuario
- [ ] Moneda configurada en perfil (CLP, COP, USD, etc.)
- [ ] Categorías básicas creadas (Alimentación, Transporte, Salud, Otros)

### Frontend
- [ ] VoiceInput actualizado (opcional)
- [ ] Servidor reiniciado
- [ ] Página recargada (Ctrl + Shift + R)

### Pruebas
- [ ] Micrófono funciona
- [ ] "50 mil" se guarda como $50,000 (NO $50.00)
- [ ] Transacciones tienen categoría
- [ ] Transacciones tienen nivel de necesidad
- [ ] Moneda correcta se muestra
- [ ] Logs sin errores

---

## 💡 CONSEJOS FINALES

### 1. Habla claro y natural
```
✅ "Comida 50 mil pesos"
❌ "Eh... comí... este... como... 50 mil..."
```

### 2. Menciona el monto completo
```
✅ "50 mil pesos" → $50,000
❌ "50" → $50 (incorrecto)
```

### 3. Usa las palabras clave
```
✅ "Jumbo" → Detecta Alimentación automáticamente
✅ "Uber" → Detecta Transporte automáticamente
✅ "Farmacia" → Detecta Salud automáticamente
```

### 4. Especifica necesidad cuando no sea obvia
```
✅ "Zapatos 60 mil necesario" → Marca como esencial
✅ "Pizza 20 mil opcional" → Marca como opcional
```

### 5. Revisa la moneda ANTES de empezar
- Ve a tu perfil
- Verifica que la moneda sea correcta
- Esto afecta TODAS las transacciones por voz

---

## 📞 SI NADA FUNCIONA

1. **Revisa los logs de Supabase**: Ahí verás el error exacto
2. **Verifica que profile_preferences tenga tu moneda**:
   ```sql
   SELECT * FROM profile_preferences WHERE user_id = 'tu-user-id';
   ```
3. **Verifica que las categorías existan**:
   ```sql
   SELECT name FROM categories WHERE user_id = 'tu-user-id';
   ```
4. **Reinicia TODO**:
   - Cierra el navegador
   - Mata el servidor (Ctrl + C)
   - Reinicia: `npm run dev`
   - Abre fresh: `Ctrl + Shift + R`

---

## 🎉 RESULTADO FINAL

```
Usuario: 🎤 "Comida 50 mil pesos necesario"
        ↓
Frontend: Envía audio
        ↓
Edge Function: Lee moneda del usuario (CLP)
        ↓
OpenAI Whisper: Transcribe "Comida 50 mil pesos necesario"
        ↓
Parser:
  - Monto: 50,000 (NO 50.00)
  - Descripción: "Comida"
  - Categoría: "Alimentación"
  - Necesidad: "essential"
  - Moneda: CLP
        ↓
Base de Datos: Guarda transacción completa
        ↓
UI: ✅ "Gasto agregado: $50,000 CLP"
```

---

**¡Todo listo!** 🚀

Ya no más confusión entre $50 y $50,000. El sistema ahora entiende perfectamente
tu moneda y tus comandos de voz.
