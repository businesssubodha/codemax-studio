import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'always' },
  trailingSlash: 'always',
  site: 'https://codemax.com.au'
});
