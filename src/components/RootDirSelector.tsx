import { useNavigate } from '@tanstack/react-router';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';

const RootDirSelector = () => {
	const navigate = useNavigate({ from: '/' });
	const { initializeRootDirHandle } = useContext(InitializationContext);

	const fileSystemAPIIsSupported = !!window.showDirectoryPicker;

	const navigateToAbout = () => {
		document.startViewTransition(() => {
			navigate({ to: '/about' });
		});
	};

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
				<div />
			</div>
			<div className="flex flex-col items-center gap-4 p-8 sm:p-16">
				{fileSystemAPIIsSupported ? (
					<>
						<p>Choose TumblThree root directory (TumblrBlogs)</p>
						<button
							className="cursor-pointer rounded-4xl bg-slate-900 px-6 py-3 text-2xl transition-colors [&:hover]:bg-slate-950"
							onClick={() => {
								document.startViewTransition(() => {
									initializeRootDirHandle?.(true);
								});
							}}
						>
							Initialize
						</button>
					</>
				) : (
					<p>
						This browser does not support the File System Access API. Try
						Chrome, Edge, Brave, Opera, or other Chromium browsers.
					</p>
				)}
			</div>
		</div>
	);
};

export default RootDirSelector;
