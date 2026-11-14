/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence the monorepo lockfile warning
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
};

export default nextConfig;
