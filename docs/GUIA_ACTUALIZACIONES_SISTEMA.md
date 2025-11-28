# 📱 GUÍA: Sistema de Actualizaciones y Limpieza de Caché

## 🎯 Funcionalidades Implementadas

### ✅ 1. Notificaciones de Actualización (Solo Móviles)
- Las notificaciones push solo se muestran en dispositivos móviles
- Se detecta automáticamente si el usuario está en móvil
- Notificación aparece cuando hay una nueva versión disponible

### ✅ 2. Limpieza Automática de Caché
- **Al iniciar sesión**: El caché se limpia automáticamente
- **Al actualizar**: El caché se limpia antes de aplicar la actualización
- Los usuarios siempre ven la versión más reciente sin limpiar manualmente

### ✅ 3. Service Worker con Versionado
- Sistema de versionado para detectar actualizaciones
- Limpieza automática de cachés antiguos
- Estrategia de caché inteligente (Network First para APIs, Cache First para assets)

---

## 📋 Archivos Creados/Modificados

### Nuevos Archivos:
1. **`public/sw.js`** - Service Worker principal
2. **`src/lib/appUpdateService.js`** - Servicio de actualizaciones
3. **`src/hooks/useAppUpdate.js`** - Hook React para actualizaciones
4. **`src/components/UpdateNotification.jsx`** - Componente de notificación

### Archivos Modificados:
1. **`src/main.jsx`** - Registro del Service Worker
2. **`src/App.jsx`** - Integración del componente UpdateNotification
3. **`src/contexts/SupabaseAuthContext.jsx`** - Limpieza de caché al iniciar sesión

---

## 🔧 Cómo Usar

### 1. Actualizar Versión en Cada Deploy

**⚠️ IMPORTANTE**: Debes actualizar la versión en **2 lugares** cada vez que despliegues:

#### A. `public/sw.js` (línea 5):
```javascript
const APP_VERSION = '2.1.0'; // ⚠️ ACTUALIZAR AQUÍ
```

#### B. `src/lib/appUpdateService.js` (línea 4):
```javascript
const APP_VERSION = '2.1.0'; // ⚠️ ACTUALIZAR AQUÍ
```

**Ejemplo de actualización:**
```javascript
// De:
const APP_VERSION = '2.1.0';

// A:
const APP_VERSION = '2.1.1'; // o 2.2.0, etc.
```

### 2. Flujo de Actualización

1. **Desarrollador actualiza código y despliega**
2. **Actualiza `APP_VERSION` en ambos archivos**
3. **Service Worker detecta nueva versión automáticamente**
4. **Usuarios móviles reciben notificación push**
5. **Al iniciar sesión, el caché se limpia automáticamente**
6. **Los cambios se reflejan inmediatamente**

### 3. Verificación Manual

Si necesitas verificar que funciona:

```javascript
// En la consola del navegador:
import appUpdateService from '@/lib/appUpdateService';

// Verificar versión actual
console.log('Versión:', appUpdateService.getVersion());

// Limpiar caché manualmente
await appUpdateService.clearCache();

// Verificar actualizaciones
await appUpdateService.checkForUpdates();
```

---

## 📱 Comportamiento por Dispositivo

### Móviles (Android/iOS):
- ✅ Reciben notificaciones push cuando hay actualización
- ✅ Banner de actualización en la parte superior
- ✅ Caché se limpia al iniciar sesión
- ✅ Cambios se reflejan automáticamente

### Desktop:
- ✅ Banner de actualización en la parte superior
- ✅ Caché se limpia al iniciar sesión
- ✅ Cambios se reflejan automáticamente
- ❌ NO reciben notificaciones push (solo móviles)

---

## 🔍 Estrategia de Caché

### Network First (APIs):
- Siempre intenta obtener datos frescos de la red
- Si falla, usa caché como fallback
- Aplica a: `/rest/v1/`, `/functions/v1/`, `/auth/v1/`

### Cache First (Assets):
- Usa caché si está disponible
- Verifica actualizaciones en background
- Aplica a: scripts, estilos, imágenes, fuentes

### Network First (HTML):
- Siempre obtiene HTML fresco
- Cachea para uso offline
- Aplica a: páginas HTML

---

## 🛠️ Troubleshooting

### Problema: Los cambios no se ven después del deploy

**Solución:**
1. Verifica que actualizaste `APP_VERSION` en ambos archivos
2. Verifica que el Service Worker se registró correctamente (consola del navegador)
3. Fuerza recarga: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)

### Problema: Notificaciones no aparecen en móvil

**Solución:**
1. Verifica que el usuario dio permiso para notificaciones
2. Verifica que es realmente un dispositivo móvil
3. Revisa la consola del navegador para errores

### Problema: Caché no se limpia al iniciar sesión

**Solución:**
1. Verifica que el Service Worker está activo
2. Revisa la consola para errores
3. Limpia caché manualmente desde DevTools si es necesario

---

## 📊 Monitoreo

### Logs del Service Worker:
- `[SW]` - Logs del Service Worker
- `[AppUpdate]` - Logs del servicio de actualizaciones

### Verificar en Consola:
```javascript
// Ver estado del Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registrado:', reg);
});

// Ver cachés activos
caches.keys().then(keys => {
  console.log('Cachés:', keys);
});
```

---

## 🚀 Próximos Pasos (Opcional)

1. **Dashboard de Versiones**: Mostrar versión actual en el dashboard
2. **Changelog**: Mostrar qué cambió en cada versión
3. **Actualización Forzada**: Opción para forzar actualización inmediata
4. **Analytics**: Trackear cuántos usuarios actualizaron

---

## ⚠️ IMPORTANTE

- **SIEMPRE actualiza `APP_VERSION` en ambos archivos antes de cada deploy**
- **Las notificaciones push solo funcionan en HTTPS (producción)**
- **El Service Worker solo funciona en producción o con configuración especial en desarrollo**

---

**Última actualización**: Sistema implementado y listo para usar
**Versión actual**: 2.1.0

