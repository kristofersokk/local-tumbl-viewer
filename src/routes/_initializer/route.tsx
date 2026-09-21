import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useContext } from 'react';

import Loader from 'Components/Loader';
import RootDirResetButton from 'Components/RootDirResetButton';
import RootDirSelector from 'Components/RootDirSelector';
import Center from 'Components/utils/Center';
import InitializationContext from 'Contexts/InitializationContext';

export const Route = createFileRoute('/_initializer')({
	component: InitializerGate,
});

function InitializerGate() {
	const { rootDirState } = useContext(InitializationContext);

	switch (rootDirState.state) {
		case 'noRootDir':
			return <RootDirSelector />;
		case 'notSupported':
			return (
				<div className="flex h-dvh w-dvw items-center justify-center">
					<p>
						This browser does not support the File System Access API. <br />
						Try Chrome, Edge, Brave, Opera, or other Chromium browsers.
					</p>
				</div>
			);
		case 'error':
			return (
				<Center className="h-dvh flex-col gap-4">
					<p>Error: {String(rootDirState.error)}</p>
					<RootDirResetButton />
				</Center>
			);
		case 'promptingUser':
			return (
				<Center className="h-dvh">
					<Loader type="clock" size={120} />
				</Center>
			);
		case 'ready':
			return <Outlet />;
		default:
			return null;
	}
}
