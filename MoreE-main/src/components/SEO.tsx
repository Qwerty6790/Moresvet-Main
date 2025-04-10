import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  ogImage?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = '', 
  url = 'https://moresvet.vercel.app', 
  ogImage = '/images/logo.svg' 
}) => {
  const siteTitle = title ? `${title} | MoreElecriki` : 'MoreElecriki | Интернет-магазин светотехники';
  
  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {url && <link rel="canonical" href={url} />}
    </Head>
  );
};

export default SEO; 