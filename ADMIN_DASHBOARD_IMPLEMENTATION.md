# Panel de Administración - Dashboard Analytics

## 📋 Resumen de Implementación

Se ha creado un sistema completo de analytics y panel de administración para medir el uso de la plataforma, comportamiento de usuarios en el landing page, y métricas de herramientas.

## 🗄️ Base de Datos

### Migración: `060_create_analytics_tables.sql`

**Tablas creadas:**

1. **`analytics_events`** - Eventos generales de usuario
   - `event_type`: Tipo de evento (page_view, tool_used, landing_section_view, login, signup)
   - `event_name`: Nombre específico del evento
   - `section_name`: Sección del landing vista
   - `tool_name`: Herramienta usada
   - `metadata`: JSONB con datos adicionales

2. **`analytics_page_views`** - Vistas de página
   - `page_path`: Ruta de la página
   - `time_on_page`: Tiempo en segundos
   - `scroll_depth`: Porcentaje de scroll (0-100)

3. **`analytics_tool_usage`** - Uso de herramientas
   - `tool_name`: Nombre de la herramienta
   - `action_type`: Acción (view, create, update, delete, export)
   - `user_id`: Usuario que usó la herramienta

4. **`analytics_impressions`** - Impresiones SEO
   - `page_path`: Página vista
   - `search_engine`: Motor de búsqueda (google, bing, direct, etc.)
   - `search_query`: Query de búsqueda
   - `is_bot`: Si es un bot

5. **`analytics_sessions`** - Sesiones de usuario
   - `session_id`: ID único de sesión
   - `duration_seconds`: Duración de la sesión
   - `page_count`: Número de páginas visitadas
   - `is_authenticated`: Si el usuario está autenticado

**Funciones SQL creadas:**
- `get_analytics_dashboard_stats()` - Estadísticas generales
- `get_tool_usage_stats()` - Estadísticas de uso de herramientas
- `get_landing_stats()` - Estadísticas del landing page

**Seguridad (RLS):**
- Solo administradores (`is_staff = true`) pueden leer todas las métricas
- Usuarios pueden insertar sus propios eventos
- Impresiones pueden ser insertadas por cualquiera (incluyendo bots)

## 🎣 Hooks Creados

### `useAnalytics.js`
Hook principal para tracking de eventos:
- `trackEvent()` - Evento genérico
- `trackPageView()` - Vista de página
- `trackToolUsage()` - Uso de herramienta
- `trackImpression()` - Impresión SEO
- `trackLandingSection()` - Sección del landing vista
- Tracking automático de scroll depth
- Tracking automático de page views al cambiar de ruta

### `useToolTracking.js`
Hook simplificado para trackear uso de herramientas:
- Mapeo automático de rutas a nombres de herramientas
- Tracking automático al montar el componente

## 📊 Componente AdminDashboard

**Ruta:** `/dashboard/admin`

**Características:**
- ✅ Solo accesible para administradores (`is_staff = true`)
- ✅ Cards con métricas principales:
  - Visitantes Landing (solo visitaron landing)
  - Usuarios Registrados
  - Usuarios Activos (usaron herramientas)
  - Impresiones (en buscadores)
- ✅ Gráficos de uso de herramientas:
  - Herramientas más usadas (top 5)
  - Herramientas no usadas
- ✅ Analytics del Landing Page:
  - Scroll promedio
  - Tiempo promedio en página
  - Tasa de rebote
  - Secciones más vistas
- ✅ Estadísticas de sesiones:
  - Total de sesiones
  - Duración promedio
  - Tasa de rebote
- ✅ Selector de rango de fechas (7, 30, 90, 365 días)

## 🔐 Protección de Acceso

El dashboard verifica que el usuario sea administrador:
1. Consulta `profile_preferences.is_staff`
2. Si no es admin, muestra pantalla de "Acceso Denegado"
3. Las funciones SQL también verifican permisos de admin

## 📍 Tracking Implementado

### Landing Page
- ✅ Tracking automático de secciones visibles (Intersection Observer)
- ✅ Tracking de scroll depth
- ✅ Tracking de tiempo en página
- ✅ Tracking de impresiones

### Herramientas del Dashboard
Tracking agregado en:
- ✅ `Transactions.jsx` - `transactions`
- ✅ `Goals.jsx` - `goals`
- ✅ `Categories.jsx` - `categories`
- ✅ `AIAssistant.jsx` - `ai-assistant`
- ✅ `Predictions.jsx` - `predictions`
- ✅ `Analysis.jsx` - `analysis`
- ✅ `FutureSelf.jsx` - `future-self`
- ✅ `DeepFinance.jsx` - `deep-finance`

### Eventos Automáticos
- ✅ Login (`event_type: 'login'`)
- ✅ Signup (`event_type: 'signup'`)
- ✅ Page views automáticos al cambiar de ruta
- ✅ Impresiones automáticas en landing page

## 🚀 Cómo Usar

### 1. Ejecutar Migración
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: supabase/migrations/060_create_analytics_tables.sql
```

### 2. Marcar Usuario como Admin
```sql
UPDATE profile_preferences
SET is_staff = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@finantel.com');
```

### 3. Acceder al Dashboard
- Navegar a `/dashboard/admin`
- O desde el Sidebar: "Administración" > "Dashboard Analytics"

### 4. Ver Métricas
- Seleccionar rango de fechas
- Ver cards con métricas principales
- Revisar gráficos de uso de herramientas
- Analizar comportamiento del landing page

## 📈 Métricas Disponibles

### Usuarios
- Visitantes Landing (solo landing, no registrados)
- Usuarios Registrados (nuevos signups)
- Usuarios Activos (usaron herramientas)
- Usuarios que iniciaron sesión

### Herramientas
- Herramientas más usadas (con contadores)
- Herramientas menos usadas
- Herramientas nunca usadas
- Usuarios únicos por herramienta

### Landing Page
- Secciones más vistas
- Scroll promedio
- Tiempo promedio en página
- Tasa de rebote

### Sesiones
- Total de sesiones
- Duración promedio
- Tasa de rebote
- Páginas por sesión

### SEO
- Impresiones totales
- Impresiones por motor de búsqueda
- Queries de búsqueda

## 🔧 Próximos Pasos (Opcional)

1. **Tracking de acciones específicas:**
   - Agregar `trackToolUsage('transactions', 'create')` al crear transacciones
   - Agregar `trackToolUsage('goals', 'create')` al crear metas
   - etc.

2. **Gráficos avanzados:**
   - Gráfico de líneas para tendencias temporales
   - Gráfico de barras para comparación de herramientas
   - Heatmap de uso por día/hora

3. **Exportación de datos:**
   - Botón para exportar métricas a CSV/Excel
   - Reportes programados por email

4. **Alertas:**
   - Alertas cuando una herramienta no se usa
   - Alertas de tasa de rebote alta
   - Alertas de caída en usuarios activos

## 📝 Notas

- El tracking es automático y no requiere configuración adicional
- Los datos se almacenan de forma anónima (sin información personal)
- Las impresiones incluyen bots (filtradas en el dashboard)
- El sistema respeta la privacidad del usuario

