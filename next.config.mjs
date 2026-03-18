/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/submit': ['./node_modules/pdfkit/js/data/**/*'],
    },
  },
};

export default nextConfig;
