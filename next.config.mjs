/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions / Route Handlers pro checkout a webhook běží defaultně
  // v Node runtime, což potřebujeme kvůli tajným proměnným (ComGate secret,
  // admin token Medusa/Strapi) - viz app/api/checkout/route.ts.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // uprav na konkrétní doménu CDN/Medusa
    ],
  },
};

export default nextConfig;
