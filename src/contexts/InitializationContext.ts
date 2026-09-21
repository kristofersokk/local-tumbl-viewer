import { createContext } from 'react';

export type RootDirState =
	| { state: 'start' }
	| { state: 'notSupported' }
	| { state: 'noRootDir' }
	| { state: 'acquiringRootDirHandle' }
	| { state: 'promptingUser' }
	| { state: 'error'; error: unknown }
	| { state: 'ready'; rootDirHandle: FileSystemDirectoryHandle };

export interface InitializationContextType {
	rootDirHandle?: FileSystemDirectoryHandle;
	initializeRootDirHandle?: (args: { allowPrompt: boolean }) => void;
	clearRootDirectoryHandle?: () => void;
	initialized: boolean;
	rootDirState: RootDirState;
}

export default createContext<InitializationContextType>({
	initialized: false,
	rootDirState: { state: 'start' },
});
