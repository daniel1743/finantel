# Reporte de Tarjetas de Métricas - Analytics de Administración

## Resumen Ejecutivo

Este documento detalla todas las tarjetas de métricas implementadas en el panel de Analytics de Administración de Finantel. El sistema cuenta con **19 tarjetas de métricas** distribuidas en diferentes secciones.

---

## 1. Métricas Principales (MetricasOverview)

**Total: 6 tarjetas**

Esta sección muestra las métricas clave del negocio que permiten monitorear el rendimiento general de la plataforma.

### 1.1 Usuarios Activos
- **Funcionalidad**: Muestra el número de usuarios activos en el período seleccionado (1d, 7d, 30d)
- **Icono**: Users (usuarios)
- **Color**: Azul
- **Características**: Incluye comparación con el período anterior (tendencia)
- **Fuente de datos**: Tabla `user_sessions` filtrando por sesiones activas

### 1.2 Nuevos Registros
- **Funcionalidad**: Cuenta de nuevos usuarios registrados en el período
- **Icono**: TrendingUp (tendencia ascendente)
- **Color**: Verde
- **Características**: Compara con el período anterior para mostrar crecimiento
- **Fuente de datos**: Tabla `auth.users` filtrando por fecha de creación

### 1.3 Retención
- **Funcionalidad**: Calcula el porcentaje de usuarios que regresan después de su primera visita
- **Icono**: Target (objetivo)
- **Color**: Púrpura
- **Características**: Muestra porcentaje de retención sin comparación temporal
- **Fuente de datos**: Análisis de sesiones de usuarios consecutivas

### 1.4 Revenue Hoy
- **Funcionalidad**: Muestra los ingresos totales generados en el período (suma de todas las transacciones de tipo 'income')
- **Icono**: DollarSign (signo de dólar)
- **Color**: Esmeralda
- **Características**: 
  - Formato de moneda compacto (números grandes se muestran como "5.6M" o "45.8k")
  - Compara con período anterior
  - Texto adaptable para evitar desbordamiento
- **Fuente de datos**: Tabla `transactions` filtrando por tipo 'income' desde `v_start_date::date`
- **Nota**: Si el valor es muy grande (millones), puede indicar que está sumando ingresos de todos los usuarios del sistema

### 1.5 Tasa de Conversión
- **Funcionalidad**: Calcula el porcentaje de usuarios que completan el proceso de registro y realizan su primera transacción
- **Icono**: Activity (actividad)
- **Color**: Naranja
- **Características**: Muestra porcentaje de conversión
- **Fuente de datos**: Comparación entre registros y usuarios con primera transacción

### 1.6 Churn Rate
- **Funcionalidad**: Calcula el porcentaje de usuarios que abandonan la plataforma
- **Icono**: TrendingUp (tendencia)
- **Color**: Rojo/Amarillo (dependiendo del valor, >10% = rojo)
- **Características**: Alerta visual si el churn rate es alto (>10%)
- **Fuente de datos**: Usuarios sin actividad reciente vs total de usuarios

---

## 2. Métricas de Engagement y Usuarios (UserEngagementMetrics)

**Total: 8 tarjetas**

Esta sección profundiza en el comportamiento y la interacción de los usuarios con la plataforma.

### 2.1 Usuarios Anónimos (Landing)
- **Funcionalidad**: Cuenta de visitantes del landing page que no tienen cuenta registrada
- **Icono**: Users (usuarios)
- **Color**: Azul
- **Subtítulo**: "Visitantes sin cuenta"
- **Fuente de datos**: Tabla `landing_analytics` filtrando sesiones sin `user_id`

### 2.2 Hora Pico de Visitas
- **Funcionalidad**: Identifica la hora del día con mayor tráfico de visitantes
- **Icono**: Clock (reloj)
- **Color**: Púrpura
- **Subtítulo**: "Mayor tráfico"
- **Formato**: HH:00 (ej: "14:00")
- **Fuente de datos**: Análisis de horas con más vistas en `landing_analytics`

### 2.3 Interacciones con IA
- **Funcionalidad**: Cuenta total de mensajes/interacciones con el asistente de IA
- **Icono**: Bot (robot)
- **Color**: Esmeralda
- **Subtítulo**: "Total de mensajes"
- **Fuente de datos**: Tabla `user_events` filtrando por `event_type = 'ai_message'`

### 2.4 Satisfacción con IA
- **Funcionalidad**: Calcula el porcentaje de feedback positivo sobre el asistente de IA
- **Icono**: ThumbsUp (pulgar arriba)
- **Color**: Verde
- **Subtítulo**: Muestra número de usuarios satisfechos
- **Fuente de datos**: Tabla `user_events` filtrando por `event_type = 'ai_feedback'` con `satisfaction = 'positive'`

### 2.5 Insatisfacción con IA
- **Funcionalidad**: Calcula el porcentaje de feedback negativo sobre el asistente de IA
- **Icono**: ThumbsDown (pulgar abajo)
- **Color**: Rojo
- **Subtítulo**: Muestra número de usuarios insatisfechos
- **Fuente de datos**: Tabla `user_events` filtrando por `event_type = 'ai_feedback'` con `satisfaction = 'negative'`

### 2.6 Abandonos
- **Funcionalidad**: Cuenta de usuarios que abandonaron la sesión rápidamente (menos de 30 segundos)
- **Icono**: XCircle (X en círculo)
- **Color**: Naranja
- **Subtítulo**: "Usuarios que salieron"
- **Fuente de datos**: Tabla `user_sessions` filtrando sesiones con duración < 30 segundos

### 2.7 Tickets Creados
- **Funcionalidad**: Cuenta de tickets de soporte creados en el período
- **Icono**: HelpCircle (círculo de ayuda)
- **Color**: Amarillo
- **Subtítulo**: "Solicitudes de soporte"
- **Fuente de datos**: Tabla `support_tickets`

### 2.8 Feedback Enviado
- **Funcionalidad**: Cuenta de comentarios y feedback enviados por usuarios
- **Icono**: MessageCircle (círculo de mensaje)
- **Color**: Índigo
- **Subtítulo**: "Comentarios recibidos"
- **Fuente de datos**: Tabla `user_events` filtrando por `event_type = 'feedback'`

---

## 3. Estado del Sistema (HealthCheck)

**Total: 5 tarjetas**

Esta sección monitorea el estado de los servicios críticos de la plataforma en tiempo real.

### 3.1 API
- **Funcionalidad**: Verifica el estado y latencia del servicio de API
- **Estados posibles**: 
  - Healthy (Operativo) - Verde
  - Degraded (Degradado) - Amarillo
  - Down (Caído) - Rojo
- **Métrica mostrada**: Latencia en milisegundos
- **Actualización**: Cada 30 segundos
- **Fuente de datos**: Tabla `system_health` con `check_type = 'api'`

### 3.2 Base de Datos
- **Funcionalidad**: Verifica el estado y latencia de la base de datos
- **Estados posibles**: Healthy, Degraded, Down
- **Métrica mostrada**: Latencia en milisegundos (test real de consulta)
- **Actualización**: Cada 30 segundos + test en tiempo real
- **Fuente de datos**: Tabla `system_health` + prueba directa de conexión

### 3.3 Almacenamiento
- **Funcionalidad**: Verifica el estado del servicio de almacenamiento
- **Estados posibles**: Healthy, Degraded, Down
- **Métrica mostrada**: Latencia en milisegundos
- **Actualización**: Cada 30 segundos
- **Fuente de datos**: Tabla `system_health` con `check_type = 'storage'`

### 3.4 Email Service
- **Funcionalidad**: Verifica el estado del servicio de envío de emails
- **Estados posibles**: Healthy, Degraded, Down
- **Métrica mostrada**: Latencia en milisegundos
- **Actualización**: Cada 30 segundos
- **Fuente de datos**: Tabla `system_health` con `check_type = 'email'`

### 3.5 Pagos
- **Funcionalidad**: Verifica el estado del servicio de pagos
- **Estados posibles**: Healthy, Degraded, Down
- **Métrica mostrada**: Latencia en milisegundos
- **Actualización**: Cada 30 segundos
- **Fuente de datos**: Tabla `system_health` con `check_type = 'payments'`

---

## 4. Uso de Herramientas (ToolUsageMetrics)

**No tiene tarjetas individuales**, pero muestra:

- **Lista de herramientas más usadas**: Top 5 herramientas con más usuarios
- **Lista de herramientas menos usadas**: Top 5 herramientas con menos usuarios
- **Métrica**: Número de usuarios por herramienta con barra de progreso visual

**Fuente de datos**: Tabla `tool_usage` con estadísticas agregadas

---

## 5. Alertas del Sistema (AlertasPanel)

**No tiene tarjetas individuales**, pero muestra:

- **Lista de alertas activas**: Hasta 20 alertas sin resolver
- **Tipos de alertas**: System, Revenue, User, Feature
- **Severidad**: Critical, Warning, Info
- **Funcionalidad**: Permite resolver alertas directamente desde el panel

**Fuente de datos**: Tabla `admin_alerts` filtrando por `is_resolved = false`

---

## Resumen Total

### Tarjetas Individuales de Métricas: 19
- Métricas Principales: **6 tarjetas**
- Engagement y Usuarios: **8 tarjetas**
- Estado del Sistema: **5 tarjetas**

### Secciones Adicionales (sin tarjetas individuales):
- Uso de Herramientas: Listas con métricas
- Alertas del Sistema: Lista de alertas

---

## Funcionalidades Generales del Dashboard

1. **Selector de Período**: Permite cambiar entre 1 día, 7 días y 30 días para todas las métricas principales
2. **Actualización Manual**: Botón de refresh para actualizar datos
3. **Actualización Automática**: 
   - Health Check se actualiza cada 30 segundos
   - Alertas se actualizan cada 30 segundos
4. **Modo Oscuro**: Todas las tarjetas soportan tema claro y oscuro
5. **Animaciones**: Efectos de entrada con Framer Motion para mejor UX

---

## Notas Técnicas

- Todas las métricas se obtienen mediante funciones almacenadas en PostgreSQL:
  - `get_admin_metrics_overview()`: Métricas principales
  - `get_engagement_metrics_detailed()`: Métricas de engagement
  - `get_tool_usage_stats()`: Estadísticas de herramientas
- Las tablas de datos están en la migración: `060_create_admin_analytics_tables.sql`
- El dashboard solo es accesible para usuarios con `is_staff = true` en `profile_preferences`

---

**Fecha del Reporte**: Diciembre 2024  
**Versión del Sistema**: Analytics de Administración v1.0

