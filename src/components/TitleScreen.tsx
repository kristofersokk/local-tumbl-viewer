import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';

const TitleScreen = () => {
	const { initializeRootDirHandle } = useContext(InitializationContext);

	return (
		<div className="flex flex-col items-center gap-4">
			<p>Choose TumblThree root directory (TumblrBlogs)</p>
			<button
				className="cursor-pointer rounded-4xl bg-slate-900 px-6 py-3 text-2xl transition-colors [&:hover]:bg-slate-950"
				onClick={() => {
					initializeRootDirHandle?.(true);
				}}
			>
				Initialize
			</button>
		</div>
	);
};

export default TitleScreen;
