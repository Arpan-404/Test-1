export default async function handler(req, res) {
  try {
    // 1. Fetch BOTH databases simultaneously for maximum speed
    const [siteRes, exRes] = await Promise.all([
      fetch('https://clinic-bdf92-default-rtdb.firebaseio.com/site.json'),
      fetch('https://patient-records-arpan-default-rtdb.firebaseio.com/exercises.json')
    ]);
    
    const siteData = await siteRes.json() || {};
    const exData = await exRes.json() || {};

    const baseUrl = 'https://therapeutichub.in';
    let urls = '';

    // URL formatter
    const slugify = (text) => text ? text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';

    // 2. Main Pages
    const mainPages = ['', '/services', '/doctors', '/products', '/articles', '/exercises', '/prescription'];
    mainPages.forEach(page => {
      urls += `<url><loc>${baseUrl}${page}</loc><changefreq>daily</changefreq><priority>${page === '' ? '1.0' : '0.8'}</priority></url>`;
    });

    // 3. Doctors
    if (siteData.doctors) {
      siteData.doctors.forEach(doc => {
        urls += `<url><loc>${baseUrl}/doctor/${slugify(doc.name)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      });
    }

    // 4. Services
    if (siteData.services) {
      siteData.services.forEach(service => {
        urls += `<url><loc>${baseUrl}/service/${slugify(service.title)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      });
    }

    // 5. Products
    if (siteData.products) {
      siteData.products.forEach(product => {
        urls += `<url><loc>${baseUrl}/product/${slugify(product.name)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
      });
    }

    // 6. Articles
    if (siteData.articles) {
      siteData.articles.forEach(article => {
        urls += `<url><loc>${baseUrl}/${article.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
      });
    }

    // 7. Exercises (From Private Database)
    Object.values(exData).forEach(ex => {
      if (ex && ex.name) {
        urls += `<url><loc>${baseUrl}/exercise/${slugify(ex.name)}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
      }
    });

    // 8. Wrap and send to Google
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(sitemap);

  } catch (error) {
    res.status(500).send('Robot Error: Could not generate sitemap');
  }
}
