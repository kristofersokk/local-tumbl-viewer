import { useRegisterSW } from 'virtual:pwa-register/react';

import { ReactNode } from 'react';
import NeedRefresh from './NeedRefresh';
import OfflineReady from './OfflineReady';
import { Toast } from 'radix-ui';

interface ServiceWorkerGuardProps {
	children: ReactNode;
}

const ServiceWorkerGuard = ({ children }: ServiceWorkerGuardProps) => {
	const {
		needRefresh: [needRefresh],
		offlineReady: [offlineReady],
		updateServiceWorker,
	} = useRegisterSW();

	return (
		<>
			<Toast.Provider swipeDirection="right">
				{needRefresh && (
					<NeedRefresh updateServiceWorker={updateServiceWorker} />
				)}
				{offlineReady && <OfflineReady />}
				<Toast.Viewport className="ToastViewport" />
			</Toast.Provider>
			{children}
		</>
	);
};

export default ServiceWorkerGuard;
