import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';
import { resetRootDirectoryHandle } from 'Utils/fileSystemUtils';

interface RootDirResetButtonProps {
	className?: string;
}

const RootDirResetButton = ({ className }: RootDirResetButtonProps) => {
	const queryClient = useQueryClient();
	const { clearRootDirectoryHandle } = useContext(InitializationContext);

	const reset = async () => {
		await resetRootDirectoryHandle();
		clearRootDirectoryHandle?.();
		queryClient.clear();
	};

	return (
		<button
			className={classNames(
				'cursor-pointer rounded-2xl bg-gray-800 px-4 py-2 transition-colors [&:hover]:bg-gray-700',
				className
			)}
			onClick={reset}
		>
			Reset
		</button>
	);
};

export default RootDirResetButton;
