import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toast } from 'radix-ui';

import ServiceWorkerGuard from 'Components/service-worker/ServiceWorkerGuard';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

export const Route = createRootRoute({
	component: () => (
		<>
			<QueryClientProvider client={queryClient}>
				<Toast.Provider swipeDirection="right">
					<ServiceWorkerGuard>
						<Outlet />
					</ServiceWorkerGuard>
				</Toast.Provider>
				{import.meta.env.DEV ? (
					<ReactQueryDevtools initialIsOpen={false} />
				) : null}
			</QueryClientProvider>
			<TanStackRouterDevtools />
		</>
	),
});
