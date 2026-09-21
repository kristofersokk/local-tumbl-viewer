import { useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import InitializationContext from 'Contexts/InitializationContext';
import HeaderPill from './HeaderPill';
import IconButton from './IconButton';
import ThemeToggle from './ThemeToggle';
import Tooltip from './Tooltip';
import { withViewTransition } from 'Utils/viewTransitionUtils';

const RootDirSelector = () => {
	const navigate = useNavigate({ from: '/' });
	const { initializeRootDirHandle } = useContext(InitializationContext);

	const navigateToAbout = () => {
		withViewTransition(() => {
			void navigate({ to: '/about' });
		});
	};

	const {
		needRefresh: [appHasUpdate],
		updateServiceWorker,
	} = useRegisterSW();

	return (
		<div className="h-dvh w-dvw">
			<div className="z-sticky max-md:bg-navbar fixed top-0 right-0 left-0 flex h-16 justify-between">
				<HeaderPill side="left" className="gap-3">
					<h3 className="text-text-highlight text-xl">TumblViewer</h3>
					<button
						className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-2xl px-4 py-2 transition-colors"
						onClick={navigateToAbout}
					>
						About
					</button>
				</HeaderPill>
				<HeaderPill side="right">
					<ThemeToggle />
					{appHasUpdate && (
						<Tooltip content="Update available">
							<IconButton
								icon="download"
								className="fill-download-icon-fill [&:hover]:bg-download-icon-hover"
								onClick={() => updateServiceWorker(true)}
							/>
						</Tooltip>
					)}
				</HeaderPill>
			</div>
			<div className="flex h-dvh flex-col items-center justify-center gap-4 p-8 pt-16 sm:p-16">
				<p>Choose TumblThree root directory (TumblrBlogs)</p>
				<button
					className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-4xl px-6 py-3 text-2xl transition-colors"
					onClick={() => {
						document.startViewTransition(() => {
							initializeRootDirHandle?.({ allowPrompt: true });
						});
					}}
				>
					Initialize
				</button>
			</div>
		</div>
	);
};

export default RootDirSelector;
