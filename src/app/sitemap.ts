import type { MetadataRoute } from 'next';

const PUBLIC_ROUTES = [
  '',
  '/login',
  '/register',
  '/reset-password',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `https://etiketa.wine${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
