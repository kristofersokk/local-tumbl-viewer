import { createContext } from 'react';

export interface InitializationContextType {
	rootDirHandle?: FileSystemDirectoryHandle;
	initializeRootDirHandle?: (allowPrompt?: boolean) => void;
	clearRootDirectoryHandle?: () => void;
	initialized: boolean;
}

export default createContext<InitializationContextType>({ initialized: false });
