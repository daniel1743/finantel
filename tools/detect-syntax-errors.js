// ============================================================================
// SCRIPT: Detector de Errores de Sintaxis
// ============================================================================
// Busca brackets sueltos, paréntesis desbalanceados, etc.
// ============================================================================

const fs = require('fs');
const path = require('path');

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'tools'];

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // 1. Buscar brackets sueltos al final de línea
    if (/^\s*\]\s*$/.test(trimmed)) {
      errors.push({
        line: lineNum,
        type: 'SOLO_BRACKET',
        message: `Bracket ']' suelto sin contexto`,
        code: trimmed,
      });
    }

    // 2. Buscar brackets sueltos seguidos de caracteres inválidos
    if (/\]\s*[^,\]\}\s\)]/.test(line)) {
      const match = line.match(/\]\s*([^,\]\}\s\)])/);
      if (match) {
        errors.push({
          line: lineNum,
          type: 'BRACKET_INVALID',
          message: `Bracket ']' seguido de carácter inválido: '${match[1]}'`,
          code: line.trim(),
        });
      }
    }

    // 3. Buscar paréntesis desbalanceados (básico)
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    // Solo reportar si hay un desbalance significativo en una sola línea
    if (Math.abs(openParens - closeParens) > 2 && openParens + closeParens > 0) {
      errors.push({
        line: lineNum,
        type: 'PAREN_IMBALANCE',
        message: `Posible desbalance de paréntesis (${openParens} abiertos, ${closeParens} cerrados)`,
        code: line.trim().substring(0, 80),
      });
    }

    if (Math.abs(openBrackets - closeBrackets) > 2 && openBrackets + closeBrackets > 0) {
      errors.push({
        line: lineNum,
        type: 'BRACKET_IMBALANCE',
        message: `Posible desbalance de brackets (${openBrackets} abiertos, ${closeBrackets} cerrados)`,
        code: line.trim().substring(0, 80),
      });
    }

    if (Math.abs(openBraces - closeBraces) > 2 && openBraces + closeBraces > 0) {
      errors.push({
        line: lineNum,
        type: 'BRACE_IMBALANCE',
        message: `Posible desbalance de llaves (${openBraces} abiertas, ${closeBraces} cerradas)`,
        code: line.trim().substring(0, 80),
      });
    }

    // 4. Buscar exportaciones duplicadas
    if (line.includes('export') && line.includes('class')) {
      const className = line.match(/export\s+class\s+(\w+)/);
      if (className) {
        // Buscar si hay otra exportación del mismo nombre más abajo
        const restOfFile = content.substring(content.indexOf(line));
        const otherExports = restOfFile.match(
          new RegExp(`export\\s*\\{\\s*${className[1]}\\s*\\}`, 'g')
        );
        if (otherExports && otherExports.length > 0) {
          errors.push({
            line: lineNum,
            type: 'DUPLICATE_EXPORT',
            message: `Exportación duplicada de '${className[1]}'`,
            code: line.trim(),
          });
        }
      }
    }
  });

  return errors;
}

// Ejecutar
console.log('🔍 Buscando errores de sintaxis...\n');

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

let totalErrors = 0;
const filesWithErrors = [];

files.forEach((file) => {
  const errors = checkFile(file);
  if (errors.length > 0) {
    totalErrors += errors.length;
    filesWithErrors.push({ file, errors });
  }
});

// Mostrar resultados
if (filesWithErrors.length === 0) {
  console.log('✅ No se encontraron errores de sintaxis obvios.');
  console.log(`   Revisados ${files.length} archivos.`);
} else {
  console.log(`❌ Se encontraron ${totalErrors} posibles errores en ${filesWithErrors.length} archivos:\n`);

  filesWithErrors.forEach(({ file, errors }) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`\n📄 ${relativePath}`);
    errors.forEach((error) => {
      console.log(`   Línea ${error.line}: [${error.type}] ${error.message}`);
      console.log(`   → ${error.code}`);
    });
  });

  console.log('\n⚠️  Revisa estos archivos manualmente.');
}

process.exit(filesWithErrors.length > 0 ? 1 : 0);

