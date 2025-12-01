# 🚀 INSTRUCCIONES DE DESPLIEGUE - VOICE TO TRANSACTION

## 📋 ÍNDICE

1. [Estructura de Archivos](#estructura-de-archivos)
2. [Cómo Desplegar](#cómo-desplegar)
3. [Nomenclatura y Nombres](#nomenclatura-y-nombres)
4. [Qué Probar](#qué-probar)
5. [Verificación Post-Despliegue](#verificación-post-despliegue)

---

## 📁 ESTRUCTURA DE ARCHIVOS

### Archivos que DEBEN estar en Supabase:

```
supabase/functions/voice-to-transaction/
├── index.ts                    ← Archivo principal (OBLIGATORIO)
└── parsers/
    ├── amount.ts              ← Parser de montos (OBLIGATORIO)
    ├── description.ts         ← Parser de descripción (OBLIGATORIO)
    ├── type.ts                ← Detector de tipo (OBLIGATORIO)
    └── category.ts            ← Clasificador de categorías (OBLIGATORIO)
```

### ⚠️ IMPORTANTE - Archivos que NO deben estar en la raíz:

**ELIMINAR estos archivos si existen en la raíz de `voice-to-transaction/`:**
- ❌ `amount.ts` (debe estar solo en `parsers/`)
- ❌ `description.ts` (debe estar solo en `parsers/`)
- ❌ `type.ts` (debe estar solo en `parsers/`)
- ❌ `category.ts` (debe estar solo en `parsers/`)

---

## 🚀 CÓMO DESPLEGAR

### Opción 1: Usando Supabase CLI (Recomendado)

#### Paso 1: Verificar que estás en la raíz del proyecto

```bash
cd "C:\Users\Lenovo\Downloads\finantel version 2.1 funcional"
```

#### Paso 2: Verificar estructura de archivos

```bash
# Verificar que existe la carpeta parsers
dir supabase\functions\voice-to-transaction\parsers

# Debe mostrar:
# amount.ts
# description.ts
# type.ts
# category.ts
```

#### Paso 3: Desplegar la función

```bash
supabase functions deploy voice-to-transaction
```

#### Paso 4: Verificar despliegue exitoso

```bash
supabase functions list
```

**Debe mostrar:**
```
voice-to-transaction  [ACTIVE]  https://[tu-proyecto].supabase.co/functions/v1/voice-to-transaction
```

---

### Opción 2: Usando Supabase Dashboard (Manual)

#### Paso 1: Acceder al Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Edge Functions** en el menú lateral

#### Paso 2: Seleccionar o crear la función

- Si ya existe `voice-to-transaction`, haz clic en ella
- Si no existe, crea una nueva función con el nombre exacto: `voice-to-transaction`

#### Paso 3: Subir archivos

**Sube estos 5 archivos en este orden:**

1. **`index.ts`** (raíz de la función)
   - Ruta local: `supabase/functions/voice-to-transaction/index.ts`
   - Debe ir en la raíz de la función en Supabase

2. **`parsers/amount.ts`**
   - Ruta local: `supabase/functions/voice-to-transaction/parsers/amount.ts`
   - Debe ir en la carpeta `parsers/` dentro de la función

3. **`parsers/description.ts`**
   - Ruta local: `supabase/functions/voice-to-transaction/parsers/description.ts`
   - Debe ir en la carpeta `parsers/` dentro de la función

4. **`parsers/type.ts`**
   - Ruta local: `supabase/functions/voice-to-transaction/parsers/type.ts`
   - Debe ir en la carpeta `parsers/` dentro de la función

5. **`parsers/category.ts`**
   - Ruta local: `supabase/functions/voice-to-transaction/parsers/category.ts`
   - Debe ir en la carpeta `parsers/` dentro de la función

#### Paso 4: Guardar y desplegar

- Haz clic en **Deploy** o **Save**
- Espera a que termine el despliegue (puede tardar 1-2 minutos)

---

## 📝 NOMENCLATURA Y NOMBRES

### ✅ Nombres CORRECTOS (usar exactamente así):

| Tipo | Nombre Exacto | Ubicación |
|------|---------------|-----------|
| **Función** | `voice-to-transaction` | `supabase/functions/voice-to-transaction/` |
| **Carpeta** | `parsers` | `supabase/functions/voice-to-transaction/parsers/` |
| **Archivo principal** | `index.ts` | `supabase/functions/voice-to-transaction/index.ts` |
| **Parser de montos** | `amount.ts` | `supabase/functions/voice-to-transaction/parsers/amount.ts` |
| **Parser de descripción** | `description.ts` | `supabase/functions/voice-to-transaction/parsers/description.ts` |
| **Detector de tipo** | `type.ts` | `supabase/functions/voice-to-transaction/parsers/type.ts` |
| **Clasificador** | `category.ts` | `supabase/functions/voice-to-transaction/parsers/category.ts` |

### ❌ Nombres INCORRECTOS (NO usar):

- ❌ `voice_to_transaction` (guiones bajos)
- ❌ `voiceToTransaction` (camelCase)
- ❌ `VoiceToTransaction` (PascalCase)
- ❌ `parser` (singular, debe ser plural)
- ❌ `Parsers` (mayúscula)
- ❌ `PARSERS` (todo mayúsculas)

### 🔍 Verificación de nombres:

```bash
# Verificar nombres correctos
cd supabase/functions/voice-to-transaction
dir
# Debe mostrar: index.ts, parsers\

cd parsers
dir
# Debe mostrar: amount.ts, description.ts, type.ts, category.ts
```

---

## 🧪 QUÉ PROBAR

### Prueba 1: Monto con formato internacional

**Audio a grabar:**
> "Tomate, $485,000 pesos"

**Resultado esperado:**
```json
{
  "amount": 485000,
  "description": "Tomate",
  "type": "expense",
  "category": "Alimentación"
}
```

**Verificación:**
- ✅ Monto debe ser `485000` (NO `485`)
- ✅ Descripción debe ser `"Tomate"` (sin números ni monedas)
- ✅ Tipo debe ser `"expense"`
- ✅ Categoría debe ser `"Alimentación"` (por la palabra "tomate")

---

### Prueba 2: Monto con formato chileno

**Audio a grabar:**
> "Gasté 50.000 en el Jumbo"

**Resultado esperado:**
```json
{
  "amount": 50000,
  "description": "Jumbo",
  "type": "expense",
  "category": "Alimentación"
}
```

**Verificación:**
- ✅ Monto debe ser `50000` (NO `50.00`)
- ✅ Descripción debe ser `"Jumbo"` (sin verbos ni montos)
- ✅ Tipo debe ser `"expense"` (por "gasté")
- ✅ Categoría debe ser `"Alimentación"` (por "Jumbo")

---

### Prueba 3: Monto con notación "k"

**Audio a grabar:**
> "Uber 15k"

**Resultado esperado:**
```json
{
  "amount": 15000,
  "description": "Uber",
  "type": "expense",
  "category": "Transporte"
}
```

**Verificación:**
- ✅ Monto debe ser `15000` (15 * 1000)
- ✅ Descripción debe ser `"Uber"`
- ✅ Tipo debe ser `"expense"` (por defecto)
- ✅ Categoría debe ser `"Transporte"` (por "uber")

---

### Prueba 4: Monto simple sin separadores

**Audio a grabar:**
> "Pizza Domino's 19000"

**Resultado esperado:**
```json
{
  "amount": 19000,
  "description": "Pizza Domino's",
  "type": "expense",
  "category": "Restaurantes"
}
```

**Verificación:**
- ✅ Monto debe ser `19000`
- ✅ Descripción debe ser `"Pizza Domino's"` (sin números)
- ✅ Tipo debe ser `"expense"`
- ✅ Categoría debe ser `"Restaurantes"` (por "pizza" y "domino")

---

### Prueba 5: Ingreso (income)

**Audio a grabar:**
> "Me pagaron 1.500.000 por un trabajo"

**Resultado esperado:**
```json
{
  "amount": 1500000,
  "description": "Trabajo",
  "type": "income",
  "category": "Otros"
}
```

**Verificación:**
- ✅ Monto debe ser `1500000` (formato chileno con múltiples puntos)
- ✅ Descripción debe ser `"Trabajo"` (sin verbos ni montos)
- ✅ Tipo debe ser `"income"` (por "me pagaron")
- ✅ Categoría debe ser `"Otros"` (no hay palabras clave)

---

### Prueba 6: Error - Sin monto detectado

**Audio a grabar:**
> "Compré algo en la tienda"

**Resultado esperado:**
```json
{
  "success": false,
  "error": "No se detectó el monto",
  "transcript": "Compré algo en la tienda"
}
```

**Verificación:**
- ✅ Debe retornar error 400
- ✅ Mensaje debe ser `"No se detectó el monto"`
- ✅ Debe incluir el transcript original

---

## ✅ VERIFICACIÓN POST-DESPLIEGUE

### Checklist de verificación:

#### 1. Verificar que la función está activa

```bash
supabase functions list
```

**Debe mostrar:**
```
voice-to-transaction  [ACTIVE]
```

#### 2. Verificar logs de despliegue

En Supabase Dashboard → Edge Functions → voice-to-transaction → Logs

**Debe mostrar:**
- ✅ "Function deployed successfully"
- ✅ Sin errores de importación
- ✅ Sin errores de sintaxis

#### 3. Verificar estructura en Supabase

En Supabase Dashboard → Edge Functions → voice-to-transaction → Files

**Debe mostrar:**
```
index.ts
parsers/
  ├── amount.ts
  ├── description.ts
  ├── type.ts
  └── category.ts
```

#### 4. Probar endpoint manualmente (opcional)

```bash
# Obtener tu URL de función
supabase functions list

# Probar con curl (reemplaza [URL] y [TOKEN])
curl -X POST https://[TU-PROYECTO].supabase.co/functions/v1/voice-to-transaction \
  -H "Authorization: Bearer [TU-TOKEN]" \
  -F "audio=@test-audio.webm" \
  -F "userId=tu-user-id"
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Module not found: parsers/amount.ts"

**Causa:** Los archivos no están en la carpeta `parsers/` dentro de Supabase

**Solución:**
1. Verifica que en Supabase Dashboard, la carpeta `parsers/` existe
2. Verifica que los 4 archivos están dentro de `parsers/`
3. Vuelve a desplegar

---

### Error: "Function failed to deploy"

**Causa:** Error de sintaxis o importación incorrecta

**Solución:**
1. Revisa los logs en Supabase Dashboard
2. Verifica que los imports en `index.ts` son:
   ```ts
   import { extractAmount } from "./parsers/amount.ts";
   import { extractDescription } from "./parsers/description.ts";
   import { detectType } from "./parsers/type.ts";
   import { classify } from "./parsers/category.ts";
   ```
3. Verifica que todos los archivos tienen la extensión `.ts`

---

### Error: "No se detectó el monto" en todas las pruebas

**Causa:** El parser de montos no está funcionando

**Solución:**
1. Verifica que `parsers/amount.ts` existe y tiene el código correcto
2. Revisa los logs de la función para ver qué está recibiendo
3. Prueba con formatos más simples primero (ej: "15000")

---

## 📊 RESUMEN DE PRUEBAS

| Prueba | Audio | Monto Esperado | Descripción Esperada | Tipo Esperado | Categoría Esperada |
|--------|-------|----------------|---------------------|---------------|-------------------|
| 1 | "Tomate, $485,000 pesos" | 485000 | "Tomate" | expense | Alimentación |
| 2 | "Gasté 50.000 en el Jumbo" | 50000 | "Jumbo" | expense | Alimentación |
| 3 | "Uber 15k" | 15000 | "Uber" | expense | Transporte |
| 4 | "Pizza Domino's 19000" | 19000 | "Pizza Domino's" | expense | Restaurantes |
| 5 | "Me pagaron 1.500.000 por un trabajo" | 1500000 | "Trabajo" | income | Otros |
| 6 | "Compré algo en la tienda" | ❌ Error | - | - | - |

---

## ✅ CHECKLIST FINAL

Antes de considerar el despliegue completo:

- [ ] Función desplegada sin errores
- [ ] Estructura de archivos correcta en Supabase
- [ ] Prueba 1 pasada (formato internacional)
- [ ] Prueba 2 pasada (formato chileno)
- [ ] Prueba 3 pasada (notación "k")
- [ ] Prueba 4 pasada (monto simple)
- [ ] Prueba 5 pasada (ingreso)
- [ ] Prueba 6 pasada (error sin monto)
- [ ] Logs sin errores
- [ ] Respuestas JSON correctas

---

**🎉 ¡Listo para usar en producción!**

---

**Última actualización:** $(date)
**Versión:** 1.0
**Estado:** ✅ Listo para despliegue

