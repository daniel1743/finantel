import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHead = ({ 
  title = "Finantel - Gestión de Finanzas Personales con IA Gratis | Control Total de tu Dinero", 
  description = "Finantel es la plataforma de gestión de finanzas personales más inteligente. Controla tus gastos, presupuestos, metas y análisis con IA. ¡Gratis y sin límites!",
  keywords = "finanzas personales, gestión de dinero, presupuestos, IA, análisis financiero, ahorros, metas financieras, control de gastos",
  image = "https://finantel.app/og-image.jpg",
  url = "https://finantel.app/",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Finantel",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "description": description,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SeoHead;
