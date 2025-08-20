import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsConfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig(() => {
	return {
		plugins: [
			// Needs to be before react plugin
			tanstackRouter({
				target: 'react',
			}),
			react(),
			tsConfigPaths(),
			tailwindcss(),
			svgr(),
		],
		server: {
			port: 3000,
		},
		build: {
			outDir: 'dist',
		},
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/setup/setupTests.ts',
			css: false,
			coverage: {
				reporter: ['text', 'json', 'html'],
				all: true,
				include: ['src/**/*.{ts,tsx}'],
				exclude: ['src/**/*.test.{ts,tsx}'],
			},
		},
	};
});
