import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

const ProductGallery = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Screenshots del producto (usando Unsplash temporalmente)
  const screenshots = [
    {
      id: 1,
      title: "Dashboard Principal",
      description: "Visualiza tu balance, gráficos y transacciones recientes en un solo lugar",
      image: "/screenshots/dashboard.png",
      placeholder: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop"
    },
    {
      id: 2,
      title: "Análisis IA Predictiva",
      description: "Predicción de flujo de caja a 30 días con inteligencia artificial",
      image: "/screenshots/ai-predictions.png",
      placeholder: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
    },
    {
      id: 3,
      title: "Detección de Suscripciones",
      description: "Encuentra servicios que pagas pero ya no usas automáticamente",
      image: "/screenshots/subscriptions.png",
      placeholder: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop"
    },
    {
      id: 4,
      title: "Categorías y Reportes",
      description: "Organiza tus gastos por categorías y visualiza reportes detallados",
      image: "/screenshots/categories.png",
      placeholder: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&sat=-100"
    },
    {
      id: 5,
      title: "Gestión Familiar",
      description: "Comparte presupuestos con hasta 5 miembros de tu familia",
      image: "/screenshots/family.png",
      placeholder: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800&fit=crop"
    }
  ];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const openLightbox = (index) => {
    setSelectedImage(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <section className="py-16 md:py-20 bg-[#F9FAFB] dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white mb-4">
              Mira Finantel en acción
            </h2>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-2xl mx-auto">
              Screenshots reales del producto que usarás todos los días
            </p>
          </motion.div>

          {/* Main Screenshot Display */}
          <div className="relative max-w-5xl mx-auto mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative bg-white dark:bg-[#0f0f11] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={screenshots[selectedImage].placeholder}
                  alt={screenshots[selectedImage].title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-auto cursor-pointer"
                  onClick={() => openLightbox(selectedImage)}
                />
              </AnimatePresence>

              {/* Expand button overlay */}
              <button
                onClick={() => openLightbox(selectedImage)}
                className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 hover:bg-white dark:hover:bg-black"
                aria-label="Ampliar imagen"
              >
                <Maximize2 className="w-5 h-5 text-[#1a1a1a] dark:text-white" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 transition-all hover:bg-white dark:hover:bg-black"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6 text-[#1a1a1a] dark:text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 transition-all hover:bg-white dark:hover:bg-black"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-6 h-6 text-[#1a1a1a] dark:text-white" />
              </button>
            </motion.div>

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-center"
            >
              <h3 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                {screenshots[selectedImage].title}
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400">
                {screenshots[selectedImage].description}
              </p>
            </motion.div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex justify-center gap-3 overflow-x-auto pb-4 max-w-4xl mx-auto">
            {screenshots.map((screenshot, index) => (
              <motion.button
                key={screenshot.id}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all
                  ${
                    selectedImage === index
                      ? 'border-[#1C8FA0] shadow-lg shadow-[#1C8FA0]/25'
                      : 'border-gray-200 dark:border-white/10 opacity-60 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={screenshot.placeholder}
                  alt={`Thumbnail ${screenshot.title}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`
                  h-2 rounded-full transition-all
                  ${selectedImage === index ? 'w-8 bg-[#1C8FA0]' : 'w-2 bg-gray-300 dark:bg-gray-600'}
                `}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation in lightbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={screenshots[selectedImage].placeholder}
                alt={screenshots[selectedImage].title}
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Caption in lightbox */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-white px-4">
              <h3 className="text-xl font-bold mb-1">{screenshots[selectedImage].title}</h3>
              <p className="text-gray-300">{screenshots[selectedImage].description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductGallery;
