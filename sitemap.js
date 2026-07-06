export default async function handler(req, res) {
    try {
        // 1. Fetch your live data directly from Firebase
        const response = await fetch('https://clinic-bdf92-default-rtdb.firebaseio.com/site.json');
        const siteData = await response.json();

        if (!siteData) {
            return res.status(500).send('Error reading database');
        }

        // Change this if your domain is different!
        const baseUrl = 'https://therapeutichub.in';

        // Helper functions exactly like your frontend uses
        const slugify = (text) => text ? text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
        const getSlug = (item) => item.customUrl || item.slug || slugify(item.displayName || item.title || item.name);
        const normalize = (data) => data ? (Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean)) : [];

        // 2. Build the list of static pages
        let urls = [
            `${baseUrl}/`,
            `${baseUrl}/branches`,
            `${baseUrl}/services`,
            `${baseUrl}/doctors`,
            `${baseUrl}/products`,
            `${baseUrl}/articles`,
            `${baseUrl}/exercises`,
            `${baseUrl}/prescription.html`
        ];

        // 3. Automatically add all your dynamic items
        const addDynamicRoutes = (items) => {
            items.forEach(item => {
                const slug = getSlug(item);
                if (slug) {
                    urls.push(`${baseUrl}/${slug}`);
                }
            });
        };

        addDynamicRoutes(normalize(siteData.doctors));
        addDynamicRoutes(normalize(siteData.services));
        addDynamicRoutes(normalize(siteData.products));
        addDynamicRoutes(normalize(siteData.articles));
        addDynamicRoutes(normalize(siteData.exercises));
        addDynamicRoutes(normalize(siteData.branches));

        // 4. Generate the XML map for Google
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
    <url>
        <loc>${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        // 5. Send it back to Google, and tell Vercel to cache it for 24 hours to stay incredibly fast
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        res.status(200).send(sitemap);

    } catch (error) {
        res.status(500).send('Internal Server Error generating sitemap');
    }
}


