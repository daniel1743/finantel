# 📦 Configuración de Storage para Avatares

## Pasos para configurar el bucket de avatares en Supabase

### 1. Crear el Bucket

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"** o **"Crear bucket"**
4. Configura:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **SÍ** (marcar como público)
   - **File size limit**: `2 MB` (opcional, pero recomendado)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp` (opcional)

### 2. Configurar Políticas RLS (Row Level Security)

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Política para que los usuarios puedan subir sus propios avatares
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para que los usuarios puedan ver todos los avatares (públicos)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para que los usuarios puedan actualizar sus propios avatares
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para que los usuarios puedan eliminar sus propios avatares
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Verificar

Después de crear el bucket y las políticas, prueba subir una foto desde la aplicación.

## Notas Importantes

- El bucket debe ser **público** para que las imágenes se puedan mostrar
- Las imágenes se comprimen automáticamente a máximo 2MB antes de subir
- El formato de nombre de archivo es: `{user_id}-{timestamp}.{ext}`

