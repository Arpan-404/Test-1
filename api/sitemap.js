export default async function handler(req, res) {
  try {
    // 1. The robot fetches all your latest data straight from Firebase!
    const response = await fetch('https://clinic-bdf92-default-rtdb.firebaseio.com/site.json');
    const siteData = await response.json();

    const baseUrl = 'https://therapeutichub.in';
    let urls = '';

    // A little tool to make names look like web links (e.g. "Arpan Das" -> "arpan-das")
    const slugify = (text) => text ? text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';

    // 2. The robot draws the main rooms of your house
    const mainPages = ['', '/services', '/doctors', '/products', '/articles', '/exercises', '/prescription'];
    mainPages.forEach(page => {
      urls += `<url><loc>${baseUrl}${page}</loc><changefreq>daily</changefreq><priority>${page === '' ? '1.0' : '0.8'}</priority></url>`;
    });

    // 3. The robot looks for all your Doctors and draws them on the map
    if (siteData.doctors) {
      siteData.doctors.forEach(doc => {
        urls += `<url><loc>${baseUrl}/doctor/${slugify(doc.name)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      });
    }

    // 4. The robot looks for all your Services
    if (siteData.services) {
      siteData.services.forEach(service => {
        urls += `<url><loc>${baseUrl}/service/${slugify(service.title)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      });
    }

    // 5. The robot looks for all your Products
    if (siteData.products) {
      siteData.products.forEach(product => {
        urls += `<url><loc>${baseUrl}/product/${slugify(product.name)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
      });
    }

    // 6. The robot looks for all your Articles
    if (siteData.articles) {
      siteData.articles.forEach(article => {
        urls += `<url><loc>${baseUrl}/${article.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
      });
    }

    // 7. The robot wraps the map up nicely in XML paper
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

    // 8. The robot hands the map to Google!
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(sitemap);

  } catch (error) {
    // If the robot trips and falls, it tells us
    res.status(500).send('Robot Error: Could not generate sitemap');
  }
}
