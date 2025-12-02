import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Azure App Service deployment
  // This creates a minimal production build with all dependencies included
  output: "standalone",

  // Optimize images
  images: {
    unoptimized: true, // Required for standalone deployment
  },

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
