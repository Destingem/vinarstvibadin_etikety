import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/test/', '/wine-test/', '/demo'],
      },
    ],
    sitemap: 'https://etiketa.wine/sitemap.xml',
    host: 'https://etiketa.wine',
  };
}
