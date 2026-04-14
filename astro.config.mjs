// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  env: {
    schema: {
      JPREMIUM_DB_HOST: envField.string({ context: 'server', access: 'secret' }),
      JPREMIUM_DB_PORT: envField.number({ context: 'server', access: 'secret', default: 3306 }),
      JPREMIUM_DB_NAME: envField.string({ context: 'server', access: 'secret' }),
      JPREMIUM_DB_USER: envField.string({ context: 'server', access: 'secret' }),
      JPREMIUM_DB_PASS: envField.string({ context: 'server', access: 'secret' })
    }
  },
  adapter: node({
    mode: 'standalone'
  }),
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
      allowedHosts: ['quickland.net', 'www.quickland.net'],
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});