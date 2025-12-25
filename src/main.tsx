import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeTree } from './routeTree.gen';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.startViewTransition = (callback: () => void) => {
	callback();
};

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Analytics />
		<RouterProvider router={router} />
	</StrictMode>
);
