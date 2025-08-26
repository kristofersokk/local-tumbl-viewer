import { useQueryClient } from '@tanstack/react-query';
import RootDirContext from 'Contexts/InitializationContext';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';
import Center from './Center';
import Loader from './Loader';
import RootDirSelector from './RootDirSelector';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const Initializer = ({ children }: InitializerProps) => {
	const queryClient = useQueryClient();

	const [rootDirHandle, setRootDirHandle] =
		useState<FileSystemDirectoryHandle>();
	const [inProgress, setInProgress] = useState(false);

	const initializeRootDirHandle = useCallback((allowPrompt?: boolean) => {
		setInProgress(true);
		getPermittedRootDirectoryHandle(allowPrompt)
			.then(dirHandle => {
				if (dirHandle && dirHandle instanceof FileSystemDirectoryHandle) {
					setRootDirHandle(dirHandle);
				}
				setInProgress(false);
			})
			.catch(() => {
				setInProgress(false);
			});
	}, []);

	const clearRootDirectoryHandle = useCallback(() => {
		setRootDirHandle(undefined);
		setInProgress(false);
		queryClient.resetQueries();
	}, [queryClient]);

	useEffect(() => {
		if (window.showDirectoryPicker) {
			initializeRootDirHandle();
		}
	}, [initializeRootDirHandle]);

	const initialized = !!rootDirHandle;

	return (
		<RootDirContext.Provider
			value={{
				rootDirHandle,
				initializeRootDirHandle,
				clearRootDirectoryHandle,
				initialized,
			}}
		>
			{initialized && children}
			{!initialized && (
				<Center>{inProgress ? <Loader /> : <RootDirSelector />}</Center>
			)}
		</RootDirContext.Provider>
	);
};

export default Initializer;
