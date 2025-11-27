#!/bin/bash
# =====================================================
# FASE 6: SCRIPT DE ROTACIÓN AUTOMÁTICA DE CLAVES
# =====================================================
# Rota automáticamente las claves de API y secretos
# =====================================================

set -e

echo "🔄 Iniciando rotación de claves de seguridad..."

# =====================================================
# 1. GENERAR NUEVAS CLAVES
# =====================================================

echo "📝 Generando nuevas claves..."

# Generar nuevo JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Generar nuevo webhook secret
NEW_WEBHOOK_SECRET=$(openssl rand -base64 32)

# Generar nuevo encryption key
NEW_ENCRYPTION_KEY=$(openssl rand -base64 32)

# =====================================================
# 2. BACKUP DE CLAVES ACTUALES
# =====================================================

echo "💾 Creando backup de claves actuales..."

BACKUP_DIR="./backups/keys/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Guardar claves actuales (si existen)
if [ -f ".env.production" ]; then
  cp .env.production "$BACKUP_DIR/.env.production.backup"
fi

# =====================================================
# 3. ACTUALIZAR VARIABLES DE ENTORNO
# =====================================================

echo "🔐 Actualizando variables de entorno..."

# Actualizar en Supabase (requiere Supabase CLI)
if command -v supabase &> /dev/null; then
  echo "Actualizando secrets en Supabase..."
  
  supabase secrets set JWT_SECRET="$NEW_JWT_SECRET" --project-ref "$SUPABASE_PROJECT_REF"
  supabase secrets set WEBHOOK_SECRET="$NEW_WEBHOOK_SECRET" --project-ref "$SUPABASE_PROJECT_REF"
  supabase secrets set ENCRYPTION_KEY="$NEW_ENCRYPTION_KEY" --project-ref "$SUPABASE_PROJECT_REF"
  
  echo "✅ Secrets actualizados en Supabase"
else
  echo "⚠️  Supabase CLI no encontrado. Actualiza manualmente en el dashboard."
fi

# Actualizar en Vercel (requiere Vercel CLI)
if command -v vercel &> /dev/null; then
  echo "Actualizando secrets en Vercel..."
  
  vercel env add JWT_SECRET production <<< "$NEW_JWT_SECRET"
  vercel env add WEBHOOK_SECRET production <<< "$NEW_WEBHOOK_SECRET"
  vercel env add ENCRYPTION_KEY production <<< "$NEW_ENCRYPTION_KEY"
  
  echo "✅ Secrets actualizados en Vercel"
else
  echo "⚠️  Vercel CLI no encontrado. Actualiza manualmente en el dashboard."
fi

# =====================================================
# 4. INVALIDAR SESIONES EXISTENTES
# =====================================================

echo "🔒 Invalidando sesiones existentes..."

# Esto requiere ejecutar una función SQL en Supabase
# Se puede hacer manualmente o con un script SQL

# =====================================================
# 5. REGISTRAR ROTACIÓN
# =====================================================

echo "📋 Registrando rotación de claves..."

ROTATION_LOG="./logs/key-rotations.log"
mkdir -p "$(dirname "$ROTATION_LOG")"

echo "$(date -Iseconds) - Rotación de claves completada" >> "$ROTATION_LOG"

# =====================================================
# 6. NOTIFICACIÓN
# =====================================================

echo ""
echo "✅ Rotación de claves completada"
echo "📁 Backup guardado en: $BACKUP_DIR"
echo "⚠️  IMPORTANTE: Actualiza manualmente las claves en:"
echo "   - Supabase Dashboard (si no usaste CLI)"
echo "   - Vercel Dashboard (si no usaste CLI)"
echo "   - Cualquier otro servicio que use estas claves"
echo ""

