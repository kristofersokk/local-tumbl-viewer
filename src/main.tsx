import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from 'Components/App';
import Initializer from 'Components/Initializer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Initializer>
				<div className="flex h-full items-center justify-center [&>*]:max-h-full">
					<App />
				</div>
			</Initializer>
		</QueryClientProvider>
	</StrictMode>
);
