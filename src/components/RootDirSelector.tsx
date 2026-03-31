import { useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import InitializationContext from 'Contexts/InitializationContext';
import IconButton from './IconButton';
import Tooltip from './Tooltip';

const RootDirSelector = () => {
	const navigate = useNavigate({ from: '/' });
	const { initializeRootDirHandle } = useContext(InitializationContext);

	const navigateToAbout = () => {
		document.startViewTransition(() => {
			navigate({ to: '/about' });
		});
	};

	const {
		needRefresh: [appHasUpdate],
		updateServiceWorker,
	} = useRegisterSW();

	return (
		<div className="grid h-dvh w-dvw grid-rows-[auto_1fr]">
			<div className="bg-navbar grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5">
				<div className="flex">
					<button
						className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-2xl px-4 py-2 transition-colors"
						onClick={navigateToAbout}
					>
						About
					</button>
				</div>
				<h3 className="text-2xl">TumblViewer</h3>
				<div className="flex justify-end">
					{appHasUpdate && (
						<Tooltip content="Update available">
							<IconButton
								icon="download"
								className="fill-download-icon-fill [&:hover]:bg-download-icon-hover"
								onClick={() => updateServiceWorker(true)}
							/>
						</Tooltip>
					)}
				</div>
			</div>
			<div className="flex flex-col items-center gap-4 p-8 sm:p-16">
				<p>Choose TumblThree root directory (TumblrBlogs)</p>
				<button
					className="cursor-pointer rounded-4xl bg-slate-900 px-6 py-3 text-2xl transition-colors [&:hover]:bg-slate-950"
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
