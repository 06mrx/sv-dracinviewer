import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			// biar dev server bisa akses file route
			allow: ['.']
		},
		historyApiFallback: true // ini penting supaya reload route dinamis tidak 404
	}
});
