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
		<div className="flex flex-col items-center gap-4">
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
					<button
						className="bg-action-button-bg [&:hover]:bg-action-button-hover-bg fixed top-0 left-0 m-4 cursor-pointer rounded-2xl px-4 py-2 transition-colors"
						onClick={navigateToAbout}
					>
						About
					</button>
				</>
			) : (
				<p>
					This browser does not support the File System API. Try Chrome or Edge.
				</p>
			)}
		</div>
	);
};

export default RootDirSelector;
