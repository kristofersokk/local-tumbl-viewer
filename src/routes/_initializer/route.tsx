import { createFileRoute, Outlet } from '@tanstack/react-router';
import Initializer from 'Components/Initializer';

export const Route = createFileRoute('/_initializer')({
	component: InitializerWrapper,
});

function InitializerWrapper() {
	return (
		<Initializer>
			<Outlet />
		</Initializer>
	);
}
