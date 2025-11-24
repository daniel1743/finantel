import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * Componente SEO reutilizable para gestionar meta tags dinámicamente
 * Uso:
 * <SEO
 *   title="Título de la página"
 *   description="Descripción de la página"
 *   image="/custom-og-image.png"
 *   url="/ruta-actual"
 * />
 */

const SEO = ({
  title = 'Finantel - Gestión Financiera Personal Inteligente',
  description = 'Controla tus gastos, establece presupuestos y alcanza tus metas de ahorro con Finantel. La herramienta de gestión financiera más completa y fácil de usar.',
  image = '/og-image.png',
  url = '',
  type = 'website',
  keywords = 'finanzas personales, control de gastos, presupuesto, ahorro, gestión financiera',
  author = 'Finantel Team',
  twitterHandle = '@finantel'
}) => {
  const siteUrl = 'https://finantel.net';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Finantel" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content={twitterHandle} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;

// Ejemplos de uso en diferentes páginas:

/**
 * // Página de Dashboard
 * <SEO
 *   title="Dashboard - Finantel"
 *   description="Visualiza y gestiona tus finanzas personales en un solo lugar"
 *   url="/dashboard"
 * />
 *
 * // Página de Precios
 * <SEO
 *   title="Precios - Finantel"
 *   description="Elige el plan perfecto para tus necesidades financieras"
 *   url="/pricing"
 * />
 *
 * // Página de Login
 * <SEO
 *   title="Iniciar Sesión - Finantel"
 *   description="Accede a tu cuenta de Finantel"
 *   url="/login"
 * />
 */
