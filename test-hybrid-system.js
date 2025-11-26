// ============================================================================
// TESTS AUTOMATIZADOS - SISTEMA HÍBRIDO
// ============================================================================
// Prueba todos los componentes del sistema híbrido
// Ejecutar: node test-hybrid-system.js
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || "TU_SUPABASE_URL";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "TU_SERVICE_KEY";

// ============================================================================
// COLORES PARA CONSOLA
// ============================================================================
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// ============================================================================
// FUNCIONES DE TEST
// ============================================================================

async function testEdgeFunction(functionName, body = {}) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  try {
    console.log(`\n→ Probando: ${functionName}`);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      log(
        colors.red,
        `✗ FALLÓ (${response.status}): ${errorText.substring(0, 200)}`
      );
      return { success: false, duration, error: errorText };
    }

    const data = await response.json();
    log(colors.green, `✓ EXITOSO (${duration}ms)`);

    if (data.stats) {
      console.log(`  Estadísticas:`, data.stats);
    }

    return { success: true, duration, data };
  } catch (error) {
    log(colors.red, `✗ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testDatabaseTable(tableName) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?limit=1`;

  try {
    console.log(`\n→ Verificando tabla: ${tableName}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!response.ok) {
      log(colors.red, `✗ Tabla no existe o no es accesible`);
      return false;
    }

    log(colors.green, `✓ Tabla existe y es accesible`);
    return true;
  } catch (error) {
    log(colors.red, `✗ ERROR: ${error.message}`);
    return false;
  }
}

// ============================================================================
// SUITE DE TESTS
// ============================================================================

async function runTests() {
  log(
    colors.cyan,
    "\n========================================\n  TESTS SISTEMA HÍBRIDO - FINANTEL\n========================================"
  );

  const results = {
    tables: [],
    bots: [],
    aiInvestigator: null,
    totalTime: 0,
  };

  const startTime = Date.now();

  // ========================================
  // TEST 1: VERIFICAR TABLAS
  // ========================================
  log(colors.blue, "\n[1/3] VERIFICANDO TABLAS SQL...");

  const tables = [
    "bot_alerts",
    "ai_model_cache",
    "api_cache",
    "bot_statistics",
    "leak_insights",
    "subscription_patterns",
  ];

  for (const table of tables) {
    const result = await testDatabaseTable(table);
    results.tables.push({ table, success: result });
  }

  // ========================================
  // TEST 2: PROBAR BOTS VIGILANTES
  // ========================================
  log(colors.blue, "\n[2/3] PROBANDO BOTS VIGILANTES...");

  const bots = [
    "bot-detect-subscriptions",
    "bot-detect-duplicates",
    "bot-detect-delivery",
    "bot-detect-microspend",
    "bot-detect-nightspend",
    "bot-detect-fixed-charges",
    "bot-detect-unusual-activity",
  ];

  for (const bot of bots) {
    const result = await testEdgeFunction(bot);
    results.bots.push({ bot, ...result });
  }

  // ========================================
  // TEST 3: PROBAR AI INVESTIGATOR
  // ========================================
  log(colors.blue, "\n[3/3] PROBANDO AI INVESTIGATOR...");

  results.aiInvestigator = await testEdgeFunction("ai-investigator");

  // ========================================
  // RESUMEN DE RESULTADOS
  // ========================================
  results.totalTime = Date.now() - startTime;

  log(
    colors.cyan,
    "\n========================================\n  RESUMEN DE RESULTADOS\n========================================"
  );

  // Tablas
  const tablesSuccess = results.tables.filter((t) => t.success).length;
  const tablesTotal = results.tables.length;
  log(
    tablesSuccess === tablesTotal ? colors.green : colors.yellow,
    `\nTablas: ${tablesSuccess}/${tablesTotal} exitosas`
  );

  if (tablesSuccess < tablesTotal) {
    console.log("Tablas fallidas:");
    results.tables
      .filter((t) => !t.success)
      .forEach((t) => console.log(`  - ${t.table}`));
  }

  // Bots
  const botsSuccess = results.bots.filter((b) => b.success).length;
  const botsTotal = results.bots.length;
  log(
    botsSuccess === botsTotal ? colors.green : colors.yellow,
    `\nBots: ${botsSuccess}/${botsTotal} exitosos`
  );

  if (botsSuccess < botsTotal) {
    console.log("Bots fallidos:");
    results.bots
      .filter((b) => !b.success)
      .forEach((b) => console.log(`  - ${b.bot}`));
  }

  // AI Investigator
  log(
    results.aiInvestigator?.success ? colors.green : colors.red,
    `\nAI Investigator: ${results.aiInvestigator?.success ? "✓ EXITOSO" : "✗ FALLÓ"}`
  );

  // Tiempo total
  log(colors.cyan, `\nTiempo total: ${results.totalTime}ms`);

  // ========================================
  // ESTADÍSTICAS DETALLADAS
  // ========================================
  log(colors.cyan, "\n========================================\n  ESTADÍSTICAS DETALLADAS\n========================================");

  const botStats = results.bots.filter((b) => b.success && b.data?.stats);

  if (botStats.length > 0) {
    console.log("\nRendimiento de bots:");

    let totalUsers = 0;
    let totalAlerts = 0;

    for (const bot of botStats) {
      const stats = bot.data.stats;
      console.log(`\n${bot.bot}:`);
      console.log(`  Usuarios procesados: ${stats.users_processed || 0}`);
      console.log(`  Alertas generadas: ${stats.alerts_generated || 0}`);
      console.log(`  Tiempo ejecución: ${stats.execution_time_ms || 0}ms`);
      console.log(`  Errores: ${stats.errors_count || 0}`);

      totalUsers += stats.users_processed || 0;
      totalAlerts += stats.alerts_generated || 0;
    }

    log(colors.green, `\nTOTAL:`);
    console.log(`  Usuarios procesados: ${totalUsers}`);
    console.log(`  Alertas generadas: ${totalAlerts}`);
  }

  if (results.aiInvestigator?.success && results.aiInvestigator.data?.stats) {
    const aiStats = results.aiInvestigator.data.stats;
    console.log(`\nAI Investigator:`);
    console.log(`  Alertas procesadas: ${aiStats.alerts_processed || 0}`);
    console.log(`  Alertas confirmadas: ${aiStats.alerts_confirmed || 0}`);
    console.log(`  Falsas alarmas: ${aiStats.false_alarms || 0}`);
    console.log(`  Tiempo ejecución: ${aiStats.execution_time_ms || 0}ms`);
  }

  // ========================================
  // RECOMENDACIONES
  // ========================================
  log(colors.cyan, "\n========================================\n  RECOMENDACIONES\n========================================\n");

  if (tablesSuccess < tablesTotal) {
    log(
      colors.yellow,
      "⚠️  Algunas tablas no están disponibles. Ejecuta las migraciones SQL."
    );
  }

  if (botsSuccess < botsTotal) {
    log(
      colors.yellow,
      "⚠️  Algunos bots fallaron. Verifica que estén desplegados correctamente."
    );
  }

  if (!results.aiInvestigator?.success) {
    log(
      colors.yellow,
      "⚠️  AI Investigator falló. Verifica que las API keys estén configuradas:"
    );
    console.log("     - DEEPSEEK_API_KEY");
    console.log("     - QWEN_API_KEY (opcional)");
    console.log("     - OPENAI_API_KEY (opcional)");
  }

  const allSuccess =
    tablesSuccess === tablesTotal &&
    botsSuccess === botsTotal &&
    results.aiInvestigator?.success;

  if (allSuccess) {
    log(
      colors.green,
      "\n✓ ¡SISTEMA COMPLETAMENTE FUNCIONAL!"
    );
  } else {
    log(
      colors.yellow,
      "\n⚠️  Sistema parcialmente funcional. Revisa las recomendaciones arriba."
    );
  }

  console.log("\n");
}

// ============================================================================
// EJECUTAR TESTS
// ============================================================================

if (SUPABASE_URL === "TU_SUPABASE_URL" || SUPABASE_SERVICE_KEY === "TU_SERVICE_KEY") {
  log(
    colors.red,
    "\n❌ ERROR: Configura las variables de entorno primero:\n"
  );
  console.log("export SUPABASE_URL=https://tu-proyecto.supabase.co");
  console.log("export SUPABASE_SERVICE_ROLE_KEY=tu-service-key");
  console.log("\nO edita las variables en el archivo test-hybrid-system.js\n");
  process.exit(1);
}

runTests().catch((error) => {
  log(colors.red, `\n❌ ERROR FATAL: ${error.message}\n`);
  process.exit(1);
});
