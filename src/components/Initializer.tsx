import RootDirContext from 'Contexts/InitializationContext';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const Initializer = ({ children }: InitializerProps) => {
	const [rootDirHandle, setRootDirHandle] =
		useState<FileSystemDirectoryHandle>();

	const initializeRootDirHandle = useCallback((allowPrompt?: boolean) => {
		getPermittedRootDirectoryHandle(allowPrompt).then(dirHandle => {
			if (dirHandle && dirHandle instanceof FileSystemDirectoryHandle) {
				setRootDirHandle(dirHandle);
			}
		});
	}, []);

	useEffect(() => {
		initializeRootDirHandle();
	}, [initializeRootDirHandle]);

	const initialized = !!rootDirHandle;

	return (
		<RootDirContext.Provider
			value={{ rootDirHandle, initializeRootDirHandle, initialized }}
		>
			{children}
		</RootDirContext.Provider>
	);
};

export default Initializer;
