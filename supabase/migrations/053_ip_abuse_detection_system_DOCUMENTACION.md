# 🛡️ Sistema de Detección de Abuso por IP - Documentación

## 📋 Resumen

Sistema inteligente que detecta abuso de cuentas free sin bloquear IPs directamente. Usa un sistema de "riesgo por IP" y device fingerprinting para identificar patrones sospechosos.

## 🎯 Características Principales

- ✅ **NO bloquea IPs directamente** - Respeta IPs compartidas (oficinas, edificios, 4G)
- ✅ **Device Fingerprinting** - Detecta reutilización de dispositivos
- ✅ **Sistema de riesgo escalonado** - Normal, Bajo, Medio, Alto, Muy Alto
- ✅ **Detección de correos desechables** - Bloquea registros con emails temporales
- ✅ **Alertas automáticas** - Notifica al admin cuando IP supera umbrales
- ✅ **Verificación requerida** - Exige verificación de email/teléfono según riesgo

## 📊 Niveles de Riesgo

| Registros en 24h | Nivel de Riesgo | Acción |
|------------------|-----------------|--------|
| 1-3 | Normal | Permitir |
| 4-6 | Bajo | Marcar |
| 7-15 | Medio | Verificación requerida + Alerta admin |
| 16-50 | Alto | Verificación requerida |
| 50+ | Muy Alto | Bloquear registro |

## 🔍 Reglas de Detección

### Regla 1: Mismo Fingerprint
- Si un dispositivo (fingerprint) crea más de 1 cuenta → **BLOQUEO INMEDIATO**

### Regla 2: IP + Fingerprint + Email Desechable
- Si misma IP + mismo fingerprint + correo desechable → **BLOQUEO INMEDIATO**

### Regla 3: Múltiples Registros desde Misma IP
- Según cantidad de registros en 24h → Aplicar nivel de riesgo correspondiente

## 🗂️ Estructura de Tablas

### 1. `ip_risk_events`
Registra cada intento de registro con su evaluación de riesgo.

**Columnas principales:**
- `ip_address`: IP del usuario
- `device_fingerprint`: Hash del fingerprint del dispositivo
- `risk_level`: Nivel de riesgo detectado
- `risk_score`: Puntuación de riesgo (0-100)
- `action_taken`: Acción tomada (allowed, verification_required, blocked)
- `is_blocked`: Si el registro fue bloqueado

### 2. `ip_risk_stats`
Estadísticas agregadas por IP para consultas rápidas.

**Columnas principales:**
- `total_registrations_24h`: Total de registros en 24 horas
- `total_registrations_7d`: Total de registros en 7 días
- `unique_fingerprints_24h`: Fingerprints únicos en 24 horas
- `last_risk_level`: Último nivel de riesgo detectado

### 3. `device_fingerprints`
Registro de fingerprints únicos de dispositivos.

**Columnas principales:**
- `fingerprint_hash`: Hash único del dispositivo
- `fingerprint_data`: Datos completos del fingerprint (JSONB)
- `account_count`: Número de cuentas creadas con este dispositivo
- `is_blocked`: Si el dispositivo está bloqueado

### 4. `admin_alerts`
Alertas para el panel de administración.

**Columnas principales:**
- `alert_type`: Tipo de alerta (ip_risk, fingerprint_abuse, suspicious_activity)
- `severity`: Severidad (low, medium, high, critical)
- `message`: Mensaje descriptivo
- `is_resolved`: Si la alerta fue resuelta

## 🔧 Funciones Principales

### 1. `check_ip_risk(p_ip_address, p_device_fingerprint, p_email)`
Función principal que verifica el riesgo de una IP y fingerprint.

**Parámetros:**
- `p_ip_address`: INET - Dirección IP del usuario
- `p_device_fingerprint`: JSONB - Datos del fingerprint del dispositivo
- `p_email`: TEXT - Email del usuario (opcional, para detectar desechables)

**Retorna:** JSONB con:
```json
{
  "allowed": true/false,
  "risk_level": "normal|low|medium|high|very_high|blocked",
  "risk_score": 0-100,
  "reason": "Descripción del riesgo",
  "action_taken": "allowed|verification_required|blocked|flagged",
  "requires_verification": true/false,
  "is_blocked": true/false,
  "stats": {
    "registrations_24h": 0,
    "registrations_7d": 0,
    "unique_fingerprints_24h": 0,
    "fingerprint_accounts": 0
  }
}
```

**Ejemplo:**
```sql
SELECT check_ip_risk(
  '192.168.1.1'::INET,
  '{"browser": "Chrome", "userAgent": "...", ...}'::JSONB,
  'user@example.com'
);
```

### 2. `is_disposable_email(p_email)`
Verifica si un correo es de un dominio desechable.

**Retorna:** BOOLEAN

### 3. `hash_fingerprint(p_fingerprint_data)`
Calcula hash SHA256 del fingerprint del dispositivo.

**Retorna:** TEXT (hash hexadecimal)

### 4. `update_ip_risk_stats()`
Actualiza estadísticas agregadas de todas las IPs.

**Ejecución:** Automática cada hora vía cron job

### 5. `get_ip_risk_stats(p_ip_address)`
Obtiene estadísticas de una IP específica o generales.

**Retorna:** JSONB con estadísticas

## 🚀 Edge Function: `check-ip-risk`

Endpoint REST para verificar riesgo antes del registro.

### Request:
```typescript
POST /functions/v1/check-ip-risk
Content-Type: application/json

{
  "device_fingerprint": {
    "browser": "Chrome",
    "userAgent": "...",
    "resolution": "1920x1080",
    "timezone": "America/New_York",
    "platform": "Win32",
    "language": "es-ES",
    "webgl": "...",
    "screen": {...},
    "hardware": {...}
  },
  "email": "user@example.com" // opcional
}
```

### Response:
```json
{
  "success": true,
  "allowed": true,
  "risk_level": "normal",
  "risk_score": 0,
  "reason": "Actividad normal",
  "action_taken": "allowed",
  "requires_verification": false,
  "is_blocked": false,
  "ip_address": "192.168.1.1",
  "stats": {...}
}
```

## 💻 Uso en Frontend

### 1. Recolectar Fingerprint

```typescript
import { collectDeviceFingerprint } from '@/lib/deviceFingerprint';

const fingerprint = await collectDeviceFingerprint();
```

### 2. Verificar Riesgo Antes de Registrar

```typescript
import { checkIPRisk } from '@/lib/deviceFingerprint';
import { registerWithRiskCheck } from '@/lib/registrationFlow';

// Opción 1: Verificar primero
const riskCheck = await checkIPRisk(supabase, email);
if (!riskCheck.allowed) {
  // Mostrar error
  return;
}

// Opción 2: Usar función integrada
const result = await registerWithRiskCheck(supabase, email, password);
if (!result.success) {
  // Manejar error
}
```

### 3. Componente de Registro

```tsx
import { RegistrationForm } from '@/components/RegistrationForm';

<RegistrationForm
  onSuccess={(user) => {
    // Redirigir o mostrar mensaje
  }}
  onError={(error) => {
    // Mostrar error
  }}
/>
```

## 📱 Device Fingerprint

El sistema recolecta:
- **Browser**: Navegador detectado
- **User Agent**: User agent completo
- **Resolution**: Resolución de pantalla
- **Timezone**: Zona horaria
- **Platform**: Plataforma (Win32, MacIntel, etc.)
- **Language**: Idioma del navegador
- **WebGL**: Hash del renderer WebGL
- **Screen**: Ancho, alto, profundidad de color
- **Hardware**: Núcleos de CPU, memoria (si disponible)
- **Canvas**: Hash del canvas (opcional)
- **Audio**: Hash del contexto de audio (opcional)

## 🔐 Seguridad (RLS)

- **ip_risk_events**: Usuarios solo ven sus propios eventos, admins ven todo
- **ip_risk_stats**: Solo admins pueden ver
- **device_fingerprints**: Solo admins pueden ver
- **admin_alerts**: Solo admins pueden ver y actualizar

## ⏰ Cron Jobs

### 1. Actualizar Estadísticas (Cada hora)
```sql
'0 * * * *' -- Ejecuta update_ip_risk_stats()
```

### 2. Limpiar Eventos Antiguos (Diario 2 AM)
```sql
'0 2 * * *' -- Ejecuta cleanup_old_ip_risk_events()
```

## 📊 Panel de Administración

El componente `IPRiskDashboard` muestra:
- Estadísticas rápidas (alertas, IPs de riesgo, etc.)
- Tabla de IPs de alto riesgo
- Lista de alertas recientes
- Capacidad de resolver alertas

## 🐛 Troubleshooting

### El fingerprint no se recolecta correctamente
- Verificar que el navegador soporte las APIs necesarias
- Algunos navegadores bloquean WebGL/Audio en modo incógnito
- Verificar consola del navegador para errores

### Las estadísticas no se actualizan
- Verificar que el cron job esté programado: `SELECT * FROM cron.job;`
- Verificar logs de PostgreSQL
- Ejecutar manualmente: `SELECT update_ip_risk_stats();`

### Los correos desechables no se detectan
- La lista de dominios se puede actualizar en la función `is_disposable_email`
- Algunos servicios nuevos pueden no estar en la lista

### El sistema bloquea usuarios legítimos
- Revisar logs en `ip_risk_events` para entender el motivo
- Ajustar umbrales en la función `check_ip_risk` si es necesario
- Considerar whitelist de IPs conocidas (no implementado aún)

## ✅ Checklist de Implementación

- [x] Tablas SQL creadas
- [x] Funciones PostgreSQL implementadas
- [x] Edge Function creada
- [x] Middleware frontend para fingerprint
- [x] Flujo de registro integrado
- [x] Componente de registro
- [x] Panel de administración
- [x] Cron jobs configurados
- [ ] Tests unitarios
- [ ] Documentación de API
- [ ] Monitoreo y alertas

## 🔄 Flujo Completo

1. **Usuario intenta registrarse**
2. **Frontend recolecta fingerprint** del dispositivo
3. **Frontend llama a Edge Function** `check-ip-risk` con fingerprint y email
4. **Edge Function llama a `check_ip_risk()`** en PostgreSQL
5. **Función evalúa riesgo** según reglas
6. **Si está bloqueado**: Retorna error, registro no se permite
7. **Si requiere verificación**: Retorna flag, registro se permite pero requiere verificación
8. **Si es normal**: Retorna allowed, registro continúa normalmente
9. **Evento se registra** en `ip_risk_events`
10. **Si riesgo >= medio**: Se crea alerta en `admin_alerts`
11. **Admin puede ver alertas** en el panel de administración

## 📈 Mejoras Futuras

- [ ] Whitelist de IPs conocidas
- [ ] Machine learning para detectar patrones más complejos
- [ ] Integración con servicios de verificación de email/teléfono
- [ ] Dashboard con gráficos y tendencias
- [ ] Exportación de reportes
- [ ] Notificaciones en tiempo real para admins

