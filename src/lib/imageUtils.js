/**
 * Utilidades para compresión y manejo de imágenes
 */

/**
 * Comprime una imagen a máximo 2MB
 * @param {File} file - Archivo de imagen
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 2)
 * @returns {Promise<File>} - Archivo comprimido
 */
export const compressImage = async (file, maxSizeMB = 2) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Máximo ancho/alto
        
        // Redimensionar si es muy grande
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Intentar diferentes calidades hasta que sea menor a 2MB
        let quality = 0.9;
        let compressedBlob = null;
        
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('No se pudo comprimir la imagen'));
                return;
              }
              
              const sizeMB = blob.size / (1024 * 1024);
              
              if (sizeMB <= maxSizeMB || quality <= 0.1) {
                // Crear nuevo File con el blob comprimido
                const compressedFile = new File(
                  [blob],
                  file.name,
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  }
                );
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte un File a base64
 * @param {File} file - Archivo
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB máximo antes de comprimir
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

