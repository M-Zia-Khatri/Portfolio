import { Head } from '@inertiajs/react';
import { memo, type ReactNode } from 'react';

/**
 * Default SEO values
 */
const DEFAULT_VALUES = {
  siteName: 'Mohammad Zia Khatri',

  siteDescription: 'Full Stack Developer specializing in Laravel, React, Inertia.js, TypeScript, and scalable modern web applications.',

  siteUrl: 'https://zia-khatri.vercel.app',

  twitterHandle: '@ZiaKhatri',

  defaultImage: 'https://zia-khatri.vercel.app/og-image.png',

  locale: 'en_US',
} as const;

/**
 * SEO best-practice limits
 */
const CHAR_LIMITS = {
  title: 60,

  description: {
    min: 120,
    max: 160,
  },
} as const;

/**
 * JSON-LD type
 */
type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

/**
 * Custom meta tag type
 */
interface CustomMeta {
  name?: string;

  property?: string;

  content: string;
}

/**
 * SEO component props
 */
export interface SEOProps {
  /**
   * Page title
   */
  title: string;

  /**
   * Meta description
   */
  description?: string;

  /**
   * Canonical URL
   */
  canonical?: string;

  /**
   * Current page URL
   */
  url?: string;

  /**
   * Robots meta
   */
  robots?: string;

  /**
   * OpenGraph type
   */
  type?: 'website' | 'article' | 'profile';

  /**
   * Preview image
   */
  image?: string;

  /**
   * Image alt text
   */
  imageAlt?: string;

  /**
   * Author name
   */
  author?: string;

  /**
   * Keywords
   */
  keywords?: string[];

  /**
   * Twitter card type
   */
  twitterCard?: 'summary' | 'summary_large_image';

  /**
   * Published date (articles)
   */
  publishedTime?: string;

  /**
   * Updated date (articles)
   */
  modifiedTime?: string;

  /**
   * JSON-LD structured data
   */
  jsonLd?: JsonLd;

  /**
   * Additional meta tags
   */
  customMeta?: CustomMeta[];

  /**
   * Extra head elements
   */
  children?: ReactNode;
}

/**
 * Truncate helper
 */
function truncate(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 3)}...`;
}

/**
 * Reusable SEO component
 *
 * Optimized for:
 * - Laravel
 * - Inertia.js
 * - React
 * - SSR
 * - OpenGraph
 * - Twitter Cards
 * - Structured data
 */
const SEO = memo(function SEO({
  title,

  description = DEFAULT_VALUES.siteDescription,

  canonical,

  url = DEFAULT_VALUES.siteUrl,

  robots = 'index, follow',

  type = 'website',

  image = DEFAULT_VALUES.defaultImage,

  imageAlt = title,

  author = DEFAULT_VALUES.siteName,

  keywords = [],

  twitterCard = 'summary_large_image',

  publishedTime,

  modifiedTime,

  jsonLd,

  customMeta = [],

  children,
}: SEOProps) {
  /**
   * Enforce SEO character limits
   */
  const truncatedTitle = truncate(title, CHAR_LIMITS.title);

  const truncatedDescription = truncate(description, CHAR_LIMITS.description.max);

  /**
   * Full title
   */
  const fullTitle = `${truncatedTitle} | ${DEFAULT_VALUES.siteName}`;

  /**
   * Canonical fallback
   */
  const canonicalUrl = canonical ?? url;

  /**
   * Default structured data
   */
  const defaultJsonLd = {
    '@context': 'https://schema.org',

    '@type': 'Person',

    name: DEFAULT_VALUES.siteName,

    url: DEFAULT_VALUES.siteUrl,

    image,

    jobTitle: 'Full Stack Developer',

    sameAs: ['https://github.com/M-Zia-Khatri', 'https://linkedin.com/in/m-zia-khatri'],
  };

  /**
   * Merge JSON-LD
   */
  const structuredData = jsonLd ?? defaultJsonLd;

  return (
    <Head title={fullTitle}>
      {/* =========================================
          BASIC SEO
      ========================================= */}

      <meta head-key="charset" charSet="utf-8" />

      <meta head-key="viewport" name="viewport" content="width=device-width, initial-scale=1" />

      <meta head-key="description" name="description" content={truncatedDescription} />

      <meta head-key="robots" name="robots" content={robots} />

      <meta head-key="author" name="author" content={author} />

      {keywords.length > 0 && <meta head-key="keywords" name="keywords" content={keywords.join(', ')} />}

      {/* =========================================
          CANONICAL
      ========================================= */}

      <link head-key="canonical" rel="canonical" href={canonicalUrl} />

      {/* =========================================
          OPEN GRAPH
      ========================================= */}

      <meta head-key="og:type" property="og:type" content={type} />

      <meta head-key="og:title" property="og:title" content={fullTitle} />

      <meta head-key="og:description" property="og:description" content={truncatedDescription} />

      <meta head-key="og:url" property="og:url" content={url} />

      <meta head-key="og:image" property="og:image" content={image} />

      <meta head-key="og:image:alt" property="og:image:alt" content={imageAlt} />

      <meta head-key="og:site_name" property="og:site_name" content={DEFAULT_VALUES.siteName} />

      <meta head-key="og:locale" property="og:locale" content={DEFAULT_VALUES.locale} />

      {/* =========================================
          TWITTER
      ========================================= */}

      <meta head-key="twitter:card" name="twitter:card" content={twitterCard} />

      <meta head-key="twitter:title" name="twitter:title" content={fullTitle} />

      <meta head-key="twitter:description" name="twitter:description" content={truncatedDescription} />

      <meta head-key="twitter:image" name="twitter:image" content={image} />

      <meta head-key="twitter:image:alt" name="twitter:image:alt" content={imageAlt} />

      <meta head-key="twitter:creator" name="twitter:creator" content={DEFAULT_VALUES.twitterHandle} />

      {/* =========================================
          ARTICLE METADATA
      ========================================= */}

      {publishedTime && <meta head-key="article:published_time" property="article:published_time" content={publishedTime} />}

      {modifiedTime && <meta head-key="article:modified_time" property="article:modified_time" content={modifiedTime} />}

      {/* =========================================
          JSON-LD
      ========================================= */}

      <script head-key="json-ld" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* =========================================
          CUSTOM META
      ========================================= */}

      {customMeta.map((meta, index) => (
        <meta
          key={`${meta.name ?? meta.property}-${index}`}
          head-key={`${meta.name ?? meta.property}-${index}`}
          name={meta.name}
          property={meta.property}
          content={meta.content}
        />
      ))}

      {/* =========================================
          EXTRA HEAD ELEMENTS
      ========================================= */}

      {children}
    </Head>
  );
});

SEO.displayName = 'SEO';

export default SEO;
