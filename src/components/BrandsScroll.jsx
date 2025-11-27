import React from 'react';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import {
  SiVisa,
  SiMastercard,
  SiPaypal,
  SiStripe,
  SiAmericanexpress,
  SiWise,
  SiSquare,
  SiRevolut
} from 'react-icons/si';

// Array de marcas financieras con iconos de Simple Icons
const brands = [
  {
    id: 1,
    name: "Visa",
    Icon: SiVisa,
    color: "#1434CB",
    url: "https://www.visa.com"
  },
  {
    id: 2,
    name: "Mastercard",
    Icon: SiMastercard,
    color: "#EB001B",
    url: "https://www.mastercard.com"
  },
  {
    id: 3,
    name: "PayPal",
    Icon: SiPaypal,
    color: "#00457C",
    url: "https://www.paypal.com"
  },
  {
    id: 4,
    name: "Stripe",
    Icon: SiStripe,
    color: "#635BFF",
    url: "https://www.stripe.com"
  },
  {
    id: 5,
    name: "American Express",
    Icon: SiAmericanexpress,
    color: "#006FCF",
    url: "https://www.americanexpress.com"
  },
  {
    id: 6,
    name: "Wise",
    Icon: SiWise,
    color: "#37517E",
    url: "https://wise.com"
  },
  {
    id: 7,
    name: "Square",
    Icon: SiSquare,
    color: "#000000",
    url: "https://www.squareup.com"
  },
  {
    id: 8,
    name: "Revolut",
    Icon: SiRevolut,
    color: "#0075EB",
    url: "https://www.revolut.com"
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
            {brands.map((brand) => {
              const Icon = brand.Icon;
              return (
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
                    className="block opacity-60 hover:opacity-100 transition-all duration-300"
                    title={brand.name}
                  >
                    <Icon
                      size={48}
                      color={brand.color}
                      className="transition-all duration-300 grayscale hover:grayscale-0"
                    />
                  </a>
                </motion.div>
              );
            })}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default BrandsScroll;

