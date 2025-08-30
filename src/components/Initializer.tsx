import { useQueryClient } from '@tanstack/react-query';
import RootDirContext from 'Contexts/InitializationContext';
import { atom, useAtom } from 'jotai';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';
import Loader from './Loader';
import RootDirSelector from './RootDirSelector';
import Center from './utils/Center';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const rootDirHandleAtom = atom<FileSystemDirectoryHandle>();

const Initializer = ({ children }: InitializerProps) => {
	const queryClient = useQueryClient();

	const [rootDirHandle, setRootDirHandle] = useAtom(rootDirHandleAtom);
	const [inProgress, setInProgress] = useState(false);

	const initializeRootDirHandle = useCallback(
		(allowPrompt?: boolean) => {
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
		},
		[setRootDirHandle]
	);

	const clearRootDirectoryHandle = useCallback(() => {
		setRootDirHandle(undefined);
		setInProgress(false);
		queryClient.resetQueries();
	}, [queryClient, setRootDirHandle]);

	useEffect(() => {
		if (window.showDirectoryPicker && !rootDirHandle) {
			initializeRootDirHandle();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
