import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: object[];
  noindex?: boolean;
  nofollow?: boolean;
  alternateLanguages?: Array<{ lang: string; href: string }>;
}

export const SEO = ({
  title,
  description,
  canonical,
  ogImage = 'https://joben.eu/og-default.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData = [],
  noindex = false,
  nofollow = false,
  alternateLanguages = [],
}: SEOProps) => {
  const fullTitle = title ? `${title} | Joben.eu` : 'Joben.eu - Aplică la joburi în <30 secunde';
  const metaRobots = [];
  if (noindex) metaRobots.push('noindex');
  if (nofollow) metaRobots.push('nofollow');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      {metaRobots.length > 0 && <meta name="robots" content={metaRobots.join(', ')} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Joben.eu" />
      {canonical && <meta property="og:url" content={canonical} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@joben_eu" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Alternate Languages (hreflang) */}
      {alternateLanguages.map(({ lang, href }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}
      
      {/* Structured Data (JSON-LD) */}
      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};
