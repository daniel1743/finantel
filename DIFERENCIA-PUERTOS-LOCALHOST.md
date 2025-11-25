# 🔌 ¿Por qué funciona en un puerto y no en otro?

## 🎯 TU PREGUNTA

**Problema:** Login funciona en `localhost:3001` pero NO en `localhost:3002`

**Respuesta corta:** Son aplicaciones diferentes. Cada puerto es una instancia separada con su propia configuración.

---

## 🔍 EXPLICACIÓN TÉCNICA

### 1. Variables de Entorno NO se comparten

Cuando ejecutas `npm run dev`, Vite:

```
1. Lee el archivo .env
2. Carga las variables (VITE_SUPABASE_URL, etc.)
3. Inicia el servidor en UN puerto específico (3001)
4. Solo ESE servidor tiene acceso a las variables
```

**Si abres localhost:3002:**
- ❌ No tiene acceso al archivo `.env`
- ❌ Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están indefinidas
- ❌ No puede conectarse a Supabase
- ❌ El login falla con "Invalid credentials"

### 2. Sesiones y Cookies son por Puerto

Los navegadores guardan sesiones de autenticación separadas por:
- Dominio (`localhost`)
- Puerto (`3001` vs `3002`)

**Ejemplo:**
```
localhost:3001 → Sesión A (token válido)
localhost:3002 → Sesión B (sin token)
```

Si inicias sesión en `:3001`, tu sesión NO estará disponible en `:3002`

### 3. Servidor de Desarrollo vs Archivos Estáticos

**localhost:3001** - Servidor de desarrollo activo
```
✅ Variables de entorno cargadas
✅ Hot reload activo
✅ Proxy configurado
✅ CORS manejado correctamente
```

**localhost:3002** - Puede ser:
```
❌ Servidor viejo cacheado
❌ Build antiguo sin actualizar
❌ Otra instancia sin configuración
❌ Archivos estáticos sin variables de entorno
```

---

## 🧪 CÓMO VERIFICAR QUÉ ESTÁ PASANDO

### Test 1: Abre la consola del navegador (F12)

En `localhost:3002`, ejecuta:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

**Si ves `undefined`:**
→ Ese puerto NO tiene acceso a las variables de entorno

**Si ves las URLs correctas:**
→ El problema es otro (sesión, CORS, etc.)

### Test 2: Verifica qué proceso está corriendo

**En terminal:**

**Windows:**
```bash
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

**Linux/Mac:**
```bash
lsof -i :3001
lsof -i :3002
```

Esto te dirá qué proceso está usando cada puerto.

---

## ✅ SOLUCIÓN

### Opción 1: Usa SIEMPRE el puerto correcto (RECOMENDADO)

**Cierra todas las pestañas y usa solo:**
```
http://localhost:3001
```

Este es el puerto donde corre `npm run dev`

### Opción 2: Mata el proceso del puerto incorrecto

**Si accidentalmente tienes dos servidores corriendo:**

**Windows:**
```bash
# Ver qué está usando el puerto 3002
netstat -ano | findstr :3002

# Matar el proceso (reemplaza PID con el número que viste)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Ver qué está usando el puerto 3002
lsof -i :3002

# Matar el proceso
kill -9 <PID>
```

### Opción 3: Limpia caché del navegador

Si seguiste abriendo `:3002` por error:

1. Abre DevTools (F12)
2. Click derecho en el botón de recargar
3. Selecciona **"Vaciar caché y volver a cargar forzadamente"**
4. O usa: `Ctrl + Shift + Delete` → Borrar caché

### Opción 4: Reinicia el servidor

```bash
# Detén el servidor (Ctrl + C en la terminal)

# Limpia caché de Node
rm -rf node_modules/.vite
# o en Windows:
rmdir /s /q node_modules\.vite

# Reinicia
npm run dev
```

---

## 🎓 REGLAS IMPORTANTES

### 1️⃣ **UN SOLO PUERTO POR PROYECTO**

Cuando haces `npm run dev`, Vite asigna un puerto (generalmente 3001).
**Usa SOLO ese puerto.**

### 2️⃣ **Las variables de entorno se cargan al inicio**

Si cambias el `.env`, debes:
```bash
# Detener servidor (Ctrl + C)
# Reiniciar
npm run dev
```

### 3️⃣ **No cambies de puerto manualmente**

Si necesitas cambiar el puerto, edita `vite.config.js`:

```javascript
export default {
  server: {
    port: 3001, // Cambia aquí
  }
}
```

### 4️⃣ **Cada puerto = App diferente**

```
localhost:3000 → Proyecto A
localhost:3001 → Proyecto B (Finantel)
localhost:3002 → Proyecto C
```

No son el mismo proyecto, aunque sean la misma carpeta.

---

## 📊 COMPARACIÓN

| Aspecto | localhost:3001 (✅) | localhost:3002 (❌) |
|---------|---------------------|---------------------|
| **Variables .env** | ✅ Cargadas | ❌ Sin cargar |
| **Sesión activa** | ✅ Sí | ❌ No |
| **CORS** | ✅ Correcto | ⚠️ Puede fallar |
| **Hot reload** | ✅ Funciona | ❌ No funciona |
| **Autenticación** | ✅ Funciona | ❌ Falla |

---

## 🐛 DEBUGGING

### Problema: "¿Cómo sé cuál es el puerto correcto?"

**Mira la terminal donde ejecutaste `npm run dev`:**

```bash
  VITE v4.5.0  ready in 500 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

El puerto que aparece ahí (`:3001`) es el correcto.

### Problema: "Se abrió solo en :3002"

**Causa:** El puerto 3001 ya estaba ocupado.

**Solución:**
1. Cierra todos los terminales
2. Mata el proceso: `taskkill /F /IM node.exe` (Windows)
3. Vuelve a iniciar: `npm run dev`

### Problema: "Tengo dos pestañas, una en cada puerto"

**Solución:**
1. Cierra la pestaña de `:3002`
2. Usa SOLO `:3001`
3. Agrega a favoritos para no confundirte

---

## 🎯 RESUMEN

**¿Por qué funciona en :3001 y no en :3002?**

```
localhost:3001
├── ✅ Servidor de desarrollo activo
├── ✅ Variables de entorno cargadas
├── ✅ Sesión de autenticación válida
└── ✅ Todo configurado correctamente

localhost:3002
├── ❌ Sin servidor o servidor viejo
├── ❌ Sin variables de entorno
├── ❌ Sin sesión de autenticación
└── ❌ Configuración incorrecta
```

---

## ✅ RECOMENDACIÓN FINAL

**Usa SIEMPRE el puerto que aparece cuando ejecutas `npm run dev`**

Para evitar confusiones:

1. **Cierra todas las pestañas**
2. **Ejecuta:** `npm run dev`
3. **Copia la URL exacta** que aparece en la terminal
4. **Pégala en el navegador**
5. **Guárdala en favoritos**

Así nunca volverás a usar el puerto equivocado. 🎯

---

**En resumen:** Cada puerto es una aplicación diferente. El puerto `:3001` tiene tu configuración correcta, el `:3002` no. ✅
