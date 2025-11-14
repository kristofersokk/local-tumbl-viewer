import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import tsConfigPaths from 'vite-tsconfig-paths';
import { analyzer } from 'vite-bundle-analyzer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
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
			VitePWA({
				includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
				manifest: {
					name: 'Local Tumbl Viewer',
					short_name: 'TumblViewer',
					description:
						'Application which shows Tumblr blog archives downloaded by TumblThree application',
					theme_color: '#364153',
					background_color: '#000',
					icons: [
						{
							src: 'pwa-64x64.png',
							sizes: '64x64',
							type: 'image/png',
						},
						{
							src: 'pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png',
						},
						{
							src: 'pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
						},
						{
							src: 'pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable',
						},
						{
							src: 'pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any',
						},
					],
				},
				devOptions: {
					enabled: false,
				},
			}),
			analyzer({
				enabled: mode === 'analyze-bundle',
			}),
		],
		server: {
			port: 3000,
		},
		build: {
			outDir: 'dist',
			sourcemap: true,
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
