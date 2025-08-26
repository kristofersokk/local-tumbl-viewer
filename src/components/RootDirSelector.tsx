import { useNavigate } from '@tanstack/react-router';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';

const RootDirSelector = () => {
	const navigate = useNavigate({ from: '/' });
	const { initializeRootDirHandle } = useContext(InitializationContext);

	const fileSystemAPIIsSupported = !!window.showDirectoryPicker;

	return (
		<div className="flex flex-col items-center gap-4">
			{fileSystemAPIIsSupported ? (
				<>
					<p>Choose TumblThree root directory (TumblrBlogs)</p>
					<button
						className="cursor-pointer rounded-4xl bg-slate-900 px-6 py-3 text-2xl transition-colors [&:hover]:bg-slate-950"
						onClick={() => {
							initializeRootDirHandle?.(true);
						}}
					>
						Initialize
					</button>
					<button
						className="fixed top-0 left-0 m-4 cursor-pointer rounded-2xl bg-gray-800 px-4 py-2 transition-colors [&:hover]:bg-gray-700"
						onClick={() => navigate({ to: '/about' })}
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
