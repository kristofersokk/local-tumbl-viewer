import { ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import NeedRefresh from './NeedRefresh';
import OfflineReady from './OfflineReady';

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
			{needRefresh && <NeedRefresh updateServiceWorker={updateServiceWorker} />}
			{offlineReady && <OfflineReady />}
			{children}
		</>
	);
};

export default ServiceWorkerGuard;
