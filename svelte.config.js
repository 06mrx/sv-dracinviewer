import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null, // jangan pakai index.html
      precompress: false,
      strict: true,
      precompress: true
    }),
  }
};

export default config;
