import { RouterProvider, createRouter } from '@tanstack/react-router';
import { PostHogProvider } from 'posthog-js/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<PostHogProvider
			apiKey="phc_VtDN9SZkBb6IZVHA86b1lRTSMWmBy67PecUm7Y3mNcS"
			options={{
				api_host: 'https://eu.i.posthog.com',
				defaults: '2025-05-24',
				capture_exceptions: true,
				debug: import.meta.env.DEV,
			}}
		>
			<RouterProvider router={router} />
		</PostHogProvider>
	</StrictMode>
);
