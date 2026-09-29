import importedPosts from '../../src/data/blog-routes.json' with { type: 'json' };
import editorialPosts from '../../src/data/editorial-routes.json' with { type: 'json' };
const blogPosts = [...importedPosts, ...editorialPosts];

// Public routes owned by the new studio. Other URLs stay on WordPress.
export const servicePaths = new Set([
  "/services/web-design-melbourne/",
  "/services/seo-content-melbourne/",
  "/services/website-maintenance-melbourne/",
  "/services/graphic-design-melbourne/",
  "/services/social-media-design-melbourne/",
  "/services/website-analysis-melbourne/"
]);
// Published WordPress articles imported at their existing canonical paths.
export const blogPageSize = 12;
export const archivePaths = new Set(blogPosts.length ? Array.from({length: Math.ceil(blogPosts.length / blogPageSize)}, (_, i) => i ? `/blog/page/${i + 1}/` : '/blog/') : []);
export const articlePaths = new Set(blogPosts.map(post => post.path));
export const articleLastModified = new Map(blogPosts.map(post => [post.path, post.modified]));
// Confirmed retired URLs with a close, live replacement on the new site.
export const legacyRedirects = new Map([
  ['/modern-website-redesign-boost-business-drive-growth/', '/website-redesign-drives-growth/'],
  ['/web-design/', '/services/web-design-melbourne/']
]);
export const assetPaths = new Set([
  "/editorial/quote-comparison.svg",
  "/editorial/enquiry-journey.svg",
  "/editorial/email-delivery.svg",
  "/editorial/lead-measurement.svg",
  "/favicon.png",
  "/favicon.ico",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/fonts/inter-OFL.txt",
  "/fonts/inter-latin.woff2",
  "/fonts/dmmono-OFL.txt",
  "/fonts/dm-mono-400.woff2",
  "/fonts/dm-mono-500.woff2",
  "/brand/codemax-logo.webp",
  "/portfolio/Furniture-420.webp",
  "/portfolio/Digital-Banking-Web-Design--420.webp",
  "/portfolio/Art-420.webp",
  "/portfolio/Art-840.webp",
  "/portfolio/Heath-Future-840.webp",
  "/portfolio/Medical-840.webp",
  "/portfolio/Driving-840.webp",
  "/portfolio/Zoo-840.webp",
  "/portfolio/Driving-420.webp",
  "/portfolio/Dentist_2-840.webp",
  "/portfolio/Food-840.webp",
  "/portfolio/Haruki-420.webp",
  "/portfolio/Home-Schooling-420.webp",
  "/portfolio/Haruki-840.webp",
  "/portfolio/Dentist_1-840.webp",
  "/portfolio/Home-Schooling-840.webp",
  "/portfolio/Native-420.webp",
  "/portfolio/Dentist-Clinic-Web-Design--420.webp",
  "/portfolio/Food-420.webp",
  "/portfolio/NFT-840.webp",
  "/portfolio/Zoo-420.webp",
  "/portfolio/Nutrition-840.webp",
  "/portfolio/Medical-420.webp",
  "/portfolio/Heath-Future-420.webp",
  "/portfolio/Native-840.webp",
  "/portfolio/Nutrition-420.webp",
  "/portfolio/Furniture-840.webp",
  "/portfolio/Dentist_1-420.webp",
  "/portfolio/NFT-420.webp",
  "/portfolio/Dentist-Clinic-Web-Design--840.webp",
  "/portfolio/Dentist_2-420.webp",
  "/portfolio/Digital-Banking-Web-Design--840.webp"
]);
