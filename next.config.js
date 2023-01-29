/** @type {import('next').NextConfig} */

const rewritePathsString = `[
  {
    source: "/api/backend/:path*",
    destination: \`\${
      process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT ?? ""
    }/:path*\`,
  },
]`;

const rewritePaths = eval(rewritePathsString);

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return rewritePaths;
  },
};

module.exports = nextConfig;
