/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// TODO: should be added back later
// await import('./src/env.mjs');

const i18n = require('./next-i18next.config.js').i18n;

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  reactStrictMode: true,
  output: 'standalone',
  i18n,
  transpilePackages: ['@jellyfin/sdk'],
});
