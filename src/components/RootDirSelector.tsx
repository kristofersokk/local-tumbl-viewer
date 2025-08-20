import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';

const RootDirSelector = () => {
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
