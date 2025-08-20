import RootDirContext from 'Contexts/InitializationContext';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { getPermittedRootDirectoryHandle } from 'Utils/fileSystemUtils';
import Center from './Center';
import RootDirSelector from './RootDirSelector';

interface InitializerProps {
	children: ReactNode | ReactNode[];
}

const Initializer = ({ children }: InitializerProps) => {
	const [rootDirHandle, setRootDirHandle] =
		useState<FileSystemDirectoryHandle>();
	const [inProgress, setInProgress] = useState(false);

	const initializeRootDirHandle = useCallback((allowPrompt?: boolean) => {
		setInProgress(true);
		try {
			getPermittedRootDirectoryHandle(allowPrompt).then(dirHandle => {
				if (dirHandle && dirHandle instanceof FileSystemDirectoryHandle) {
					setRootDirHandle(dirHandle);
				}
			});
		} finally {
			setInProgress(false);
		}
	}, []);

	useEffect(() => {
		if (window.showDirectoryPicker) {
			initializeRootDirHandle();
		}
	}, [initializeRootDirHandle]);

	const initialized = !!rootDirHandle;

	return (
		<RootDirContext.Provider
			value={{ rootDirHandle, initializeRootDirHandle, initialized }}
		>
			{initialized && children}
			{!initialized && (
				// TODO: use spinner
				<Center>{inProgress ? <p>Loading...</p> : <RootDirSelector />}</Center>
			)}
		</RootDirContext.Provider>
	);
};

export default Initializer;
