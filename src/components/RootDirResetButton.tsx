import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';
import { resetRootDirectoryHandle } from 'Utils/fileSystemUtils';
import { withViewTransition } from 'Utils/viewTransitionUtils';

interface RootDirResetButtonProps {
	className?: string;
}

const RootDirResetButton = ({ className }: RootDirResetButtonProps) => {
	const queryClient = useQueryClient();
	const { clearRootDirectoryHandle } = useContext(InitializationContext);

	const reset = async () => {
		await resetRootDirectoryHandle();
		withViewTransition(() => {
			clearRootDirectoryHandle?.();
			queryClient.clear();
		});
	};

	return (
		<button
			className={classNames(
				'bg-action-button-bg [&:hover]:bg-action-button-hover-bg cursor-pointer rounded-2xl px-4 py-2 transition-colors',
				className
			)}
			onClick={reset}
		>
			Reset
		</button>
	);
};

export default RootDirResetButton;
