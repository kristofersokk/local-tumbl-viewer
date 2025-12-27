import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import RootDirContext from 'Contexts/InitializationContext';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';

import Loader from './Loader';
import RootDirSelector from './RootDirSelector';
import Center from './utils/Center';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const Initializer = ({ children }: InitializerProps) => {
	const queryClient = useQueryClient();

	const [rootDirState, setRootDirState] = useState<
		| { state: 'start' }
		| { state: 'notSupported' }
		| { state: 'noRootDir' }
		| { state: 'acquiringRootDirHandle' }
		| { state: 'promptingUser' }
		| { state: 'error'; error: unknown }
		| { state: 'ready'; rootDirHandle: FileSystemDirectoryHandle }
	>({ state: 'start' });

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
		queryClient.resetQueries();
	}, [queryClient]);

	useEffect(() => {
		if (rootDirState.state === 'start') {
			const fileSystemAPIIsSupported = !!window.showDirectoryPicker;
			if (fileSystemAPIIsSupported) {
				initializeRootDirHandle({
					allowPrompt: false,
				});
			} else {
				setRootDirState({ state: 'notSupported' });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			}}
		>
			{rootDirState.state === 'noRootDir' && <RootDirSelector />}
			{rootDirState.state === 'notSupported' && (
				<div className="flex h-dvh w-dvw items-center justify-center">
					<p>
						This browser does not support the File System Access API. <br />
						Try Chrome, Edge, Brave, Opera, or other Chromium browsers.
					</p>
				</div>
			)}
			{rootDirState.state === 'ready' && children}
			{rootDirState.state === 'error' && (
				<p>Error: {String(rootDirState.error)}</p>
			)}
			{rootDirState.state === 'promptingUser' && (
				<Center className="h-dvh">
					<Loader type="clock" size={120} />
				</Center>
			)}
		</RootDirContext.Provider>
	);
};

export default Initializer;
