import React from 'react';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';

// Logos de marcas (puedes reemplazar con logos reales)
const brands = [
  {
    id: 1,
    name: "TechCorp",
    logo: "https://via.placeholder.com/150x60/1C8FA0/FFFFFF?text=TechCorp",
    url: "#"
  },
  {
    id: 2,
    name: "FinanceHub",
    logo: "https://via.placeholder.com/150x60/E47B45/FFFFFF?text=FinanceHub",
    url: "#"
  },
  {
    id: 3,
    name: "MoneyFlow",
    logo: "https://via.placeholder.com/150x60/1a1a1a/FFFFFF?text=MoneyFlow",
    url: "#"
  },
  {
    id: 4,
    name: "WealthTech",
    logo: "https://via.placeholder.com/150x60/1C8FA0/FFFFFF?text=WealthTech",
    url: "#"
  },
  {
    id: 5,
    name: "FinTech Pro",
    logo: "https://via.placeholder.com/150x60/E47B45/FFFFFF?text=FinTech+Pro",
    url: "#"
  },
  {
    id: 6,
    name: "SmartFinance",
    logo: "https://via.placeholder.com/150x60/1a1a1a/FFFFFF?text=SmartFinance",
    url: "#"
  },
  {
    id: 7,
    name: "BudgetMaster",
    logo: "https://via.placeholder.com/150x60/1C8FA0/FFFFFF?text=BudgetMaster",
    url: "#"
  },
  {
    id: 8,
    name: "CashFlow",
    logo: "https://via.placeholder.com/150x60/E47B45/FFFFFF?text=CashFlow",
    url: "#"
  }
];

const BrandsScroll = () => {
  return (
    <section className="py-16 bg-white dark:bg-[#0f0f11] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-[#1C8FA0] tracking-widest uppercase mb-2">
            Confiado por empresas líderes
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white">
            Marcas que confían en Finantel
          </h2>
        </motion.div>

        {/* Scroll Container con react-fast-marquee */}
        <div className="relative">
          {/* Gradient Overlays para efecto fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />

          {/* Marquee Component */}
          <Marquee
            speed={50} // Velocidad del scroll (1-100, más alto = más rápido)
            gradient={false} // Desactivamos el gradiente por defecto para usar el nuestro
            pauseOnHover={true} // Pausa al pasar el mouse
            direction="left" // Dirección: derecha a izquierda
            className="py-4"
          >
            {brands.map((brand) => (
              <motion.div
                key={brand.id}
                className="flex items-center justify-center mx-8 md:mx-12"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <a
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-12 md:h-16 w-auto object-contain max-w-[150px]"
                    loading="lazy"
                  />
                </a>
              </motion.div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default BrandsScroll;

