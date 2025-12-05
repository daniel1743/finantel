import React, { useLayoutEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHead = ({ 
  title = "Finantel – Control de Gastos y Finanzas Personales con IA", 
  description = "Controla tus gastos, detecta fugas de dinero y entiende tus finanzas. Ideal para Chile, Latinoamérica y España. IA que te ayuda a ver en qué se va tu plata.",
  keywords = "finanzas personales, gastos, control gastos, presupuesto, IA financiera, latinoamérica, españa, plata, ahorro",
  image = "https://www.finantel.net/og-image.png",
  url = "https://www.finantel.net",
  type = "website"
}) => {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // Ensure component only renders after mount to avoid context issues
    // Using useLayoutEffect to minimize delay in setting meta tags
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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
      <meta property="twitter:title" content="Finantel – Finanzas Personales con IA" />
      <meta property="twitter:description" content="Controla tus gastos, detecta fugas de dinero y entiende tus finanzas. Compatible con CLP, MXN, ARS, COP, EUR y más." />
      <meta property="twitter:image" content={image} />

      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Finantel",
          "url": "https://www.finantel.net",
          "logo": "https://www.finantel.net/INANTEL.svg",
          "foundingLocation": "Chile",
          "description": "Plataforma de finanzas personales para el mundo hispanohablante.",
          "sameAs": [
            "https://www.instagram.com/finantel",
            "https://www.tiktok.com/@finantel",
            "https://www.linkedin.com/company/finantel"
          ]
        })}
      </script>
      
      {/* Structured Data - SoftwareApplication */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Finantel",
          "operatingSystem": "Web",
          "applicationCategory": "FinanceApplication",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "CLP"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SeoHead;
