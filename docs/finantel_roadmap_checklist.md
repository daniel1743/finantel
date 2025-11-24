# 🧭 Roadmap Finantel — Checklist de Dolor → Solución

Este documento resume los hallazgos del estudio + benchmark y los transforma en tareas priorizadas **de menor a mayor complejidad**. Cada paso incluye: qué se hará, qué cambia, dependencias y el dolor que resuelve.

---

## ✅ Paso 1 — Transparencia Radical (Baja complejidad)

- **Se hará:**  
  - Crear sección “Finantel no toca tu dinero” en onboarding y dashboard.  
  - Añadir página pública de políticas (privacidad, uso de datos, auditoría).  
  - Mostrar tabla simple con comisiones = $0 y responsabilidades del usuario.
- **Se cambiará/agregará:**  
  - Componentes UI (Modal onboarding + `DashboardHome` banner).  
  - Ruta `/legal/transparencia`.
- **Resultado esperado:**  
  - Usuarios entienden rápidamente que Finantel solo registra y no retiene fondos.  
  - Menos tickets por “¿Dónde está mi dinero?”.
- **Dolor que resuelve:**  
  - Falta de confianza, miedo a retenciones o cargos ocultos (Dolor #1 y #3 del estudio).

---

## ✅ Paso 2 — Soporte Humano + IA Visible (Baja/Media)

- **Se hará:**  
  - Panel “Centro de Ayuda” con estado de ticket y tiempos de respuesta.  
  - Conectar asistente IA actual al contexto de soporte (FAQ + últimas alertas).  
  - Botón “Hablar con una persona” (cola manual vía email/WhatsApp).
- **Se cambiará/agregará:**  
  - Página `/dashboard/support`.  
  - Tabla `support_tickets` en Supabase + trigger de notificaciones.
- **Resultado esperado:**  
  - Usuarios tienen canal claro para escalar problemas y ver seguimiento.  
  - IA responde con datos reales antes de derivar a humano.
- **Dolor que resuelve:**  
  - Soporte robotizado/inexistente (Dolor #2 y #9).

---

## ✅ Paso 3 — Automatizar Datos Básicos (Media)

- **Se hará:**  
  - Botón “Importar CSV/PDF” en `Transactions`.  
  - Supabase Edge Function que: recibe archivo → usa IA/OCR → normaliza → inserta transacciones.  
  - Reglas de duplicados y vista previa antes de guardar.
- **Se cambiará/agregará:**  
  - Modal `ImportTransactionsModal`.  
  - Función `process_statement(file)` con almacenamiento temporal.  
  - Columna `source` en `transactions`.
- **Resultado esperado:**  
  - 70% de la data recurrente se carga en minutos (sin escribir manualmente).  
  - Primer paso hacia automatización total.
- **Dolor que resuelve:**  
  - Fatiga manual, usuarios regresando a Excel (Dolor #6).

---

## ✅ Paso 4 — Clasificación Automática + Reglas Inteligentes (Media/Alta)

- **Se hará:**  
  - Servicio IA que clasifica descripción/monto → categoría, tags, tipo.  
  - Motor de reglas estilo “si X entonces Y” editable por usuario (ej. gasto > $500 → alerta).  
  - UI para ver y editar reglas activas.
- **Se cambiará/agregará:**  
  - Tabla `automation_rules`.  
  - Función `apply_rules_on_transaction(tx)` ejecutada via trigger/Edge Function.  
  - Ajustes en `useFinance` para guardar metadata sugerida.
- **Resultado esperado:**  
  - Cada transacción entra categorizada y etiquetada sin intervención.  
  - Usuarios reciben alertas en tiempo real con contexto.
- **Dolor que resuelve:**  
  - Apps reactivas y sin inteligencia (Dolor #8) + carga manual.

---

## ✅ Paso 5 — Materialized Views + Performance (Media/Alta)

- **Se hará:**  
  - Crear vistas materializadas para agregados diarios/semana/mes (`mv_daily_balances`, `mv_category_totals`).  
  - Cron/trigger que refresque vistas después de importaciones.  
  - API (`/rpc/get_dashboard_snapshot`) que lee directamente de las vistas.
- **Se cambiará/agregará:**  
  - Scripts SQL 021+ para vistas.  
  - Hook `useFinance` consumiendo snapshot en lugar de cálculos cliente.
- **Resultado esperado:**  
  - Dashboards cargan en < 1s aun con miles de registros.  
  - Base sólida para IA y predicciones.
- **Dolor que resuelve:**  
  - Experiencia lenta / inconsistente y necesidad de recalcular todo al abrir la app.

---

## ✅ Paso 6 — Integraciones Ligeras (Alta)

- **Se hará:**  
  - Conectores “plug & play”: Google Sheets, MercadoPago, Facebook Ads.  
  - Webhooks o sincronización diaria que crea transacciones automáticamente.  
  - UI para conectar/desconectar servicios y revisar registros importados.
- **Se cambiará/agregará:**  
  - Edge Functions específicas (`sync_sheets`, `sync_mpago`, `sync_ads`).  
  - Tabla `external_integrations` + logs.
- **Resultado esperado:**  
  - Usuarios solo “conectan algo” y Finantel mantiene los datos al día.  
  - Casos de negocio (e-commerce, ads) tienen inversión/revenue automático.
- **Dolor que resuelve:**  
  - “Todo lo tengo que escribir yo” y falta de automatización avanzada (Dolor #6).

---

## ✅ Paso 7 — Plantillas & Workflows guiados (Alta)

- **Se hará:**  
  - Biblioteca de plantillas: Hogar, Freelance, Ads Manager, Fuxion, etc.  
  - Cada plantilla crea categorías, dashboards, reglas y objetivos preconfigurados.  
  - Onboarding pregunta “¿Cómo usarás Finantel?” y aplica plantilla.
- **Se cambiará/agregará:**  
  - Tabla `workflow_templates` (JSON) + script de seed.  
  - UI en onboarding para seleccionar y editar.
- **Resultado esperado:**  
  - Usuario entra y en 5 minutos tiene todo configurado para su realidad.  
  - Reduce abandono por “no sé cómo empezar”.
- **Dolor que resuelve:**  
  - Falta de acompañamiento y curvas de aprendizaje (Dolor #7 y #9).

---

## ✅ Paso 8 — IA Financiera Preventiva (Muy Alta)

- **Se hará:**  
  - Función `get_financial_recommendations(user_id)` que combina: vistas materializadas + reglas + proyecciones.  
  - El asistente IA usará esta función antes de responder (“¿Puedo gastar esto hoy?”).  
  - Panel con recomendaciones accionables y simulaciones.
- **Se cambiará/agregará:**  
  - Nueva tabla `ai_recommendations_log`.  
  - Edge Function para exponer datos agregados con seguridad.  
  - UI en Dashboard mostrando “acciones sugeridas”.
- **Resultado esperado:**  
  - Finantel pasa de registrar a guiar: predice problemas, prioriza pagos, alerta de fugas.  
  - Experiencia comparable a apps premium (Fintonic, Emma, Clara).
- **Dolor que resuelve:**  
  - Apps reactivas sin guía, falta de “financiero personal” (Dolor #8 y #9).

---

### Cómo usar este checklist

1. Trabajar de arriba hacia abajo; cada paso destraba el siguiente.  
2. Al cerrar cada paso, documentar “qué se hizo + métricas de dolor resuelto”.  
3. Mantener este archivo actualizado con fecha y responsable.

Cuando terminemos los 8 pasos, Finantel cubrirá todos los puntos críticos del estudio y se alineará con las expectativas de usuarios 2025. 🚀

