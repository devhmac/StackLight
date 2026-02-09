/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimize barrel file imports for better bundle size and faster builds
    // See: https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

export default nextConfig;
