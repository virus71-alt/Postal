/** @type {import('next').NextConfig} */
const nextConfig = {
  // The default next/image optimizer requires a server, which doesn't exist
  // in a static export. Disabling it makes <Image> emit plain <img> tags.
  images: {
    unoptimized: true,
  },

  // Emit /directory/np/44600/index.html instead of /directory/np/44600.html
  // so any static host (Cloudflare Pages, Netlify, S3, nginx) serves clean
  // URLs without rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
