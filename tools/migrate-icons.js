#!/usr/bin/env node
/**
 * =====================================================
 * SCRIPT DE MIGRACIÓN DE ICONOGRAFÍA
 * =====================================================
 * Convierte iconos de lucide-react a usar el componente Icon centralizado
 *
 * USO:
 *   node tools/migrate-icons.js
 * =====================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de tamaños de Tailwind a tamaños del sistema
const sizeMap = {
  'w-3 h-3': 'xs',    // 12px
  'w-4 h-4': 'sm',    // 16px
  'w-5 h-5': 'md',    // 20px
  'w-6 h-6': 'lg',    // 24px
  'w-8 h-8': 'xl',    // 32px
};

// Mapeo de colores de Tailwind a colores del sistema
const colorMap = {
  'text-green-600': 'success',
  'text-green-400': 'success',
  'text-red-600': 'error',
  'text-red-400': 'error',
  'text-amber-600': 'warning',
  'text-amber-400': 'warning',
  'text-yellow-600': 'warning',
  'text-yellow-400': 'warning',
  'text-\\[#1C8FA0\\]': 'primary',
  'text-\\[#6E6E73\\]': 'default',
  'text-gray-400': 'muted',
  'text-gray-500': 'muted',
  'text-white': 'white',
  'text-\\[#1a1a1a\\]': 'dark',
};

// Estadísticas de migración
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  iconsConverted: 0,
  errors: [],
};

/**
 * Convierte un archivo a usar el componente Icon
 */
function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Verificar si ya usa el componente Icon
    if (content.includes("import Icon from '@/components/ui/Icon'") ||
        content.includes('import Icon from "../ui/Icon"') ||
        content.includes('import Icon from "../../ui/Icon"')) {
      console.log(`⏭️  Omitiendo ${path.basename(filePath)} - Ya usa Icon component`);
      stats.filesProcessed++;
      return;
    }

    // Verificar si importa lucide-react
    const lucideImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
    if (!lucideImportMatch) {
      return; // No usa lucide-react
    }

    const importedIcons = lucideImportMatch[1]
      .split(',')
      .map(icon => icon.trim())
      .filter(icon => icon.length > 0);

    let modified = false;
    let conversions = 0;

    // Convertir cada icono importado
    importedIcons.forEach(iconName => {
      // Buscar usos del icono con className
      const iconRegex = new RegExp(
        `<${iconName}\\s+className=["']([^"']+)["']\\s*(?:\\/?>|>[^<]*<\\/${iconName}>)`,
        'g'
      );

      content = content.replace(iconRegex, (match, className) => {
        // Extraer tamaño
        let size = 'md'; // default
        for (const [tailwindSize, systemSize] of Object.entries(sizeMap)) {
          if (className.includes(tailwindSize)) {
            size = systemSize;
            break;
          }
        }

        // Extraer color
        let color = 'default';
        for (const [tailwindColor, systemColor] of Object.entries(colorMap)) {
          const regex = new RegExp(tailwindColor);
          if (regex.test(className)) {
            color = systemColor;
            break;
          }
        }

        // Extraer clases adicionales (hover, dark, etc.)
        let additionalClasses = className
          .replace(/w-\d+/g, '')
          .replace(/h-\d+/g, '')
          .replace(/text-[^\s]+/g, '')
          .replace(/dark:text-[^\s]+/g, '')
          .trim();

        // Construir el componente Icon
        let iconComponent = `<Icon component={${iconName}} size="${size}" color="${color}"`;
        if (additionalClasses.length > 0) {
          iconComponent += ` className="${additionalClasses}"`;
        }
        iconComponent += ' />';

        conversions++;
        return iconComponent;
      });
    });

    if (conversions > 0) {
      // Agregar import de Icon si no existe
      if (!content.includes('import Icon from')) {
        // Encontrar la posición después de los imports de React
        const reactImportMatch = content.match(/import React[^;]*;/);
        if (reactImportMatch) {
          const insertPosition = content.indexOf(reactImportMatch[0]) + reactImportMatch[0].length;
          content = content.slice(0, insertPosition) +
                   "\nimport Icon from '@/components/ui/Icon';" +
                   content.slice(insertPosition);
        } else {
          // Si no hay import de React, agregar al inicio
          content = "import Icon from '@/components/ui/Icon';\n" + content;
        }
      }

      modified = true;
      stats.iconsConverted += conversions;
    }

    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)} - ${conversions} iconos convertidos`);
      stats.filesModified++;
    }

    stats.filesProcessed++;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error en ${path.basename(filePath)}: ${error.message}`);
  }
}

/**
 * Procesa recursivamente un directorio
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Omitir node_modules, .git, dist, etc.
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
      migrateFile(fullPath);
    }
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🚀 Iniciando migración de iconografía...\n');

  const srcPath = path.join(__dirname, '..', 'src');

  if (!fs.existsSync(srcPath)) {
    console.error('❌ No se encontró el directorio src/');
    process.exit(1);
  }

  processDirectory(srcPath);

  // Mostrar resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(60));
  console.log(`📁 Archivos procesados: ${stats.filesProcessed}`);
  console.log(`✏️  Archivos modificados: ${stats.filesModified}`);
  console.log(`🎨 Iconos convertidos: ${stats.iconsConverted}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errores encontrados: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`   - ${path.basename(file)}: ${error}`);
    });
  }

  console.log('\n✨ Migración completada!\n');
}

// Ejecutar
main();
