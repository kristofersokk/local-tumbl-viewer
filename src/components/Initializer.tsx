import RootDirContext from 'Contexts/InitializationContext';
import { ReactNode, useCallback, useState } from 'react';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const Initializer = ({ children }: InitializerProps) => {
	const [rootDirHandle, setRootDirHandle] =
		useState<FileSystemDirectoryHandle>();

	const initializeRootDirHandle = useCallback(() => {
		getPermittedRootDirectoryHandle().then(dirHandle => {
			if (dirHandle && dirHandle instanceof FileSystemDirectoryHandle) {
				setRootDirHandle(dirHandle);
			}
		});
	}, []);

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
