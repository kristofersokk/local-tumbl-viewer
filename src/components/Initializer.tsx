import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import RootDirContext, { RootDirState } from 'Contexts/InitializationContext';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const Initializer = ({ children }: InitializerProps) => {
	const queryClient = useQueryClient();

	const [rootDirState, setRootDirState] = useState<RootDirState>({
		state: 'start',
	});

	const initializeRootDirHandle = useCallback(
		({ allowPrompt }: { allowPrompt: boolean }) => {
			setRootDirState({ state: 'acquiringRootDirHandle' });
			getPermittedRootDirectoryHandle({
				allowPrompt,
				onPrompt: () => {
					setRootDirState({ state: 'promptingUser' });
				},
				onError: (error: unknown) => {
					console.log('Error obtaining root directory handle:', error);
					setRootDirState({ state: 'error', error });
				},
			})
				.then(dirHandle => {
					if (dirHandle) {
						if (dirHandle instanceof FileSystemDirectoryHandle) {
							setRootDirState({ state: 'ready', rootDirHandle: dirHandle });
						} else {
							setRootDirState({
								state: 'error',
								error: new Error('Invalid directory handle'),
							});
						}
					} else {
						setRootDirState({ state: 'noRootDir' });
					}
				})
				.catch((e: unknown) => {
					console.error(
						'Error initializing root directory handle:',
						JSON.stringify(e)
					);
					setRootDirState({ state: 'error', error: e });
				});
		},
		[]
	);

	const clearRootDirectoryHandle = useCallback(() => {
		setRootDirState({ state: 'noRootDir' });
		void queryClient.resetQueries();
	}, [queryClient]);

	useEffect(() => {
		if (rootDirState.state === 'start') {
			const fileSystemAPIIsSupported =
				!!window.showDirectoryPicker && typeof Array.fromAsync === 'function';
			if (fileSystemAPIIsSupported) {
				initializeRootDirHandle({
					allowPrompt: false,
				});
			} else {
				setRootDirState({ state: 'notSupported' });
			}
		}
		// oxlint-disable-next-line react-hooks/exhaustive-deps
	}, [initializeRootDirHandle]);

	return (
		<RootDirContext.Provider
			value={{
				rootDirHandle:
					rootDirState.state === 'ready'
						? rootDirState.rootDirHandle
						: undefined,
				initializeRootDirHandle,
				clearRootDirectoryHandle,
				initialized: rootDirState.state === 'ready',
				rootDirState,
			}}
		>
			{children}
		</RootDirContext.Provider>
	);
};

export default Initializer;
