import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  ogImage?: string;
  type?: string;
  image?: string;
  openGraph?: Record<string, any>;
  jsonLd?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = '', 
  url = 'https://moresvet.vercel.app', 
  ogImage = '/images/logo.svg',
  type = 'website',
  image,
  openGraph,
  jsonLd,
}) => {
  const siteTitle = title ? `${title} | MORESVET` : 'MORESVET | Интернет-магазин светотехники';
  
  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:type" content={openGraph?.type || type || 'website'} />
      <meta property="og:title" content={openGraph?.title || siteTitle} />
      <meta property="og:description" content={openGraph?.description || description} />
      <meta property="og:url" content={openGraph?.url || url} />
      <meta property="og:image" content={openGraph?.image || image || ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {url && <link rel="canonical" href={url} />}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </Head>
  );
};

export default SEO; 