# 🎤 Dónde Encontrar el Micrófono de Voz en Finantel

## 📍 Ubicación del Componente

El micrófono de entrada por voz está ubicado en:

**Página: Transacciones**
- Ruta: `/dashboard/transactions`
- Archivo: `src/pages/dashboard/Transactions.jsx` (línea 658)

---

## 🔍 Cómo Acceder al Micrófono

### Paso 1: Inicia sesión en la aplicación
```
URL: http://localhost:5173/auth
o
URL: https://tu-dominio.vercel.app/auth
```

### Paso 2: Ve al Dashboard
Después de iniciar sesión, serás redirigido al Dashboard

### Paso 3: Navega a "Transacciones"
En el menú lateral o navegación principal, haz click en:
```
📊 Transacciones
```

### Paso 4: Busca el botón del micrófono
En la parte superior de la página de Transacciones verás:

```
┌─────────────────────────────────────────────┐
│  Transacciones                              │
│  Gestiona y revisa todos tus movimientos    │
│                                             │
│  ┌──────────────────┐  ┌─────────────────┐ │
│  │   🎤 BOTÓN      │  │  + Nueva        │ │
│  │   MICRÓFONO     │  │    Transacción  │ │
│  │   (Circular)    │  │                 │ │
│  │   Color: Azul   │  │                 │ │
│  └──────────────────┘  └─────────────────┘ │
│                                             │
│  Agregar gasto por voz                      │
│  Di algo como "Gasté 50k en Jumbo"          │
└─────────────────────────────────────────────┘
```

---

## 🎯 Características Visuales del Botón

### Estado IDLE (Inactivo)
- **Color**: Azul turquesa (#1C8FA0)
- **Icono**: Micrófono 🎤
- **Tamaño**: Circular grande (80x80px)
- **Texto debajo**: "Agregar gasto por voz"

### Estado RECORDING (Grabando)
- **Color**: Rojo (#EF4444)
- **Icono**: Cuadrado ⏹️ (Stop)
- **Animación**: Pulso rojo animado
- **Texto debajo**: "Grabando..." con punto parpadeante

### Estado PROCESSING (Procesando)
- **Color**: Azul (opaco)
- **Icono**: Spinner girando ⏳
- **Texto debajo**: "Procesando... Analizando tu mensaje"

### Estado SUCCESS (Éxito)
- **Color**: Verde (#10B981)
- **Icono**: Checkmark ✅
- **Texto debajo**: "¡Listo!" + transcripción

### Estado ERROR (Error)
- **Color**: Rojo
- **Icono**: Alerta ⚠️
- **Texto debajo**: "Error - Intenta nuevamente"

---

## 📱 Cómo Usar el Micrófono

### 1. Haz click en el botón del micrófono
El navegador te pedirá permiso para acceder al micrófono

### 2. Permite el acceso al micrófono
Click en "Permitir" cuando aparezca el popup del navegador

### 3. Habla tu transacción
Ejemplos de comandos:
```
✅ "Gasté 50 mil en Jumbo"
✅ "Pagué 30k en Uber"
✅ "Compré 15 mil en Farmacia Cruz Verde"
✅ "Gasté 100 mil en Líder"
```

### 4. Click nuevamente para detener
El botón cambiará a rojo con un cuadrado (Stop)

### 5. Espera el procesamiento
Verás el spinner mientras se procesa el audio

### 6. ¡Listo!
La transacción se agregará automáticamente a tu lista

---

## 🛠️ Requisitos Técnicos

### Navegadores Compatibles
- ✅ Chrome (recomendado)
- ✅ Edge
- ✅ Firefox
- ✅ Safari (Mac/iOS)
- ❌ Internet Explorer (no soportado)

### Permisos Necesarios
- Acceso al micrófono del dispositivo
- Conexión a internet (para Whisper API)

### Variables de Entorno Requeridas
- `VITE_OPENAI_API_KEY` - Para OpenAI Whisper
- `VITE_SUPABASE_URL` - Para guardar transacciones
- `VITE_SUPABASE_ANON_KEY` - Para autenticación

---

## 🐛 Solución de Problemas

### El botón no aparece
- Verifica que estás en `/dashboard/transactions`
- Verifica que iniciaste sesión correctamente
- Revisa la consola del navegador (F12) por errores

### El micrófono no graba
- Permite permisos de micrófono en el navegador
- Verifica que tu micrófono funciona en otras apps
- Prueba con HTTPS (necesario para MediaRecorder API)

### Error al procesar
- Verifica que `VITE_OPENAI_API_KEY` esté configurada
- Verifica que la Edge Function esté desplegada en Supabase
- Revisa la consola del navegador por errores de red

### No detecta el monto o comercio
El parser reconoce estos formatos:
- Montos: "50k", "30 mil", "$1200", "cincuenta mil"
- Comercios: después de "en" → "gasté 50k EN Jumbo"

---

## 📊 Ejemplo de Flujo Completo

```
Usuario → Click en 🎤
       ↓
Navegador → "¿Permitir micrófono?" → Permitir
       ↓
Usuario → Dice: "Gasté 50 mil en Jumbo"
       ↓
Usuario → Click en ⏹️ (detener)
       ↓
App → Procesa con Whisper API
       ↓
Whisper → Transcribe: "Gasté 50 mil en Jumbo"
       ↓
Parser NLP → Detecta:
           • Monto: 50000
           • Comercio: Jumbo
           • Categoría: Alimentación
       ↓
Supabase → Guarda en tabla transactions
       ↓
Usuario → Ve toast: "✅ Gasto agregado: $50,000"
       ↓
Lista → Se actualiza automáticamente
```

---

## ✅ Verificación Rápida

Para verificar que todo está funcionando:

1. Abre: `http://localhost:5173/dashboard/transactions`
2. Busca el botón circular azul con ícono de micrófono
3. Debería decir debajo: "Agregar gasto por voz"
4. Click y permite permisos
5. Di: "Gasté mil pesos en Jumbo"
6. Click para detener
7. Deberías ver: "✅ Gasto agregado"

---

**¡El micrófono ya está integrado y listo para usarse!** 🎉
