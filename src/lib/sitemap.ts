import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function generateSitemap(): Promise<string> {
  const baseUrl = 'https://joben.eu';
  const urls: SitemapUrl[] = [];

  // Static pages
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' as const },
    { loc: '/about', priority: 0.8, changefreq: 'monthly' as const },
    { loc: '/contact', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
    { loc: '/terms', priority: 0.5, changefreq: 'yearly' as const },
  ];

  urls.push(...staticPages.map(page => ({
    ...page,
    loc: `${baseUrl}${page.loc}`,
    lastmod: new Date().toISOString().split('T')[0],
  })));

  // Fetch all active jobs
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (jobs) {
      urls.push(...jobs.map(job => ({
        loc: `${baseUrl}/jobs/${job.id}`,
        lastmod: new Date(job.updated_at).toISOString().split('T')[0],
        changefreq: 'weekly' as const,
        priority: 0.9,
      })));
    }
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}
