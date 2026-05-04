import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Default values for SEO meta tags
 * These are used as fallbacks when props are not provided
 */
const DEFAULT_VALUES = {
  siteName: 'Mohammad Zia Khatri',
  siteDescription:
    'Full Stack Developer specializing in React, Node.js, and modern web technologies. Building scalable applications with clean code.',
  siteUrl: 'https://zia-khatri.vercel.app',
  twitterHandle: '@ZiaKhatri',
  defaultImage: 'https://zia-khatri.vercel.app/og-image.png',
};

/**
 * Character limits for SEO best practices
 */
const CHAR_LIMITS = {
  title: 60,
  description: { min: 120, max: 160 },
};

/**
 * Props for the SEO component
 */
interface SEOProps {
  /** Page title - should be unique per page and include primary keyword */
  title: string;
  /** Page description - 120-160 characters, include CTA and keywords naturally */
  description: string;
  /** Canonical URL for the page */
  canonical?: string;
  /** Robots meta tag - defaults to "index, follow" */
  robots?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Open Graph URL - defaults to site URL */
  ogUrl?: string;
  /** Open Graph type - defaults to "website" */
  ogType?: string;
  /** Twitter card type - defaults to "summary_large_image" */
  twitterCard?: string;
  /** Twitter creator handle */
  twitterCreator?: string;
  /** Additional custom meta tags */
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

/**
 * Reusable SEO component for managing meta tags
 * Implements best practices for SEO, Open Graph, and Twitter Cards
 * Memoized to avoid unnecessary re-renders
 */
const SEO = memo(function SEO({
  title,
  description,
  canonical = DEFAULT_VALUES.siteUrl,
  robots = 'index, follow',
  ogImage = DEFAULT_VALUES.defaultImage,
  ogUrl = DEFAULT_VALUES.siteUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterCreator = DEFAULT_VALUES.twitterHandle,
  customMeta = [],
}: SEOProps) {
  // Ensure title doesn't exceed character limit
  const truncatedTitle =
    title.length > CHAR_LIMITS.title ? `${title.slice(0, CHAR_LIMITS.title - 3)}...` : title;

  // Ensure description is within character limits
  const truncatedDescription =
    description.length > CHAR_LIMITS.description.max
      ? `${description.slice(0, CHAR_LIMITS.description.max - 3)}...`
      : description.length < CHAR_LIMITS.description.min
        ? description
        : description;

  const fullTitle = `${truncatedTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDescription} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={DEFAULT_VALUES.siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={ogImage} />
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* Additional Meta Tags for SEO */}
      <meta name="author" content={DEFAULT_VALUES.siteName} />
      {/* Note: keywords meta tag is deprecated and not recommended for SEO */}

      {/* Custom Meta Tags */}
      {customMeta.map((meta, index) => (
        <meta key={index} name={meta.name} property={meta.property} content={meta.content} />
      ))}

      {/* Schema.org JSON-LD for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: DEFAULT_VALUES.siteName,
          url: DEFAULT_VALUES.siteUrl,
          jobTitle: 'Full Stack Developer',
          sameAs: ['https://github.com/M-Zia-Khatri', 'https://linkedin.com/in/m-zia-khatri'],
        })}
      </script>
    </Helmet>
  );
});

export default SEO;

/**
 * Type export for SEO props - useful when extending the component
 */
export type { SEOProps };
