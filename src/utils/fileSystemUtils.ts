import { cacheValueAsync, clearCacheValue } from './cacheUtils';
import {
	deleteValue,
	OBJECT_STORES,
	retrieveValue,
	storeValue,
} from './indexedDbUtils';

const ROOT_FOLDER_KEY = 'rootFolder';

export async function getPermittedRootDirectoryHandle({
	allowPrompt,
	onPrompt,
	onError,
}: {
	allowPrompt: boolean;
	onPrompt: () => void;
	onError: (error: unknown) => void;
}) {
	const dirHandle = await getRootDirectoryHandle({ allowPrompt, onPrompt });
	if (!dirHandle) {
		console.info('No root directory handle found');
		return undefined;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const permission = await dirHandle.queryPermission({
		mode: 'read',
	});
	console.log('Permission for root directory:', permission);
	if (permission === 'granted') {
		return dirHandle;
	}
	if (allowPrompt && permission === 'prompt') {
		onPrompt();
		return promptForRootDirectoryHandle();
	}

	onError('No read permission granted for root directory');
	return undefined;
}

async function getRootDirectoryHandle({
	allowPrompt,
	onPrompt,
}: {
	allowPrompt: boolean;
	onPrompt: () => void;
}) {
	const { value: dirHandle } = await cacheValueAsync(
		'GLOBAL',
		'root-folder',
		() =>
			retrieveValue(OBJECT_STORES.FILE_HANDLES, ROOT_FOLDER_KEY).then(
				handle => handle ?? null
			)
	);
	if (dirHandle) {
		return dirHandle;
	}

	if (allowPrompt) {
		onPrompt();
		return promptForRootDirectoryHandle();
	}
	return undefined;
}

async function promptForRootDirectoryHandle() {
	console.log('Prompting for root directory handle');
	const newDirHandle: FileSystemDirectoryHandle =
		await window.showDirectoryPicker!({
			id: ROOT_FOLDER_KEY,
		});
	await storeValue(OBJECT_STORES.FILE_HANDLES, ROOT_FOLDER_KEY, newDirHandle);

	return newDirHandle;
}

export async function resetRootDirectoryHandle() {
	clearCacheValue('GLOBAL', 'root-folder');
	return deleteValue(OBJECT_STORES.FILE_HANDLES, ROOT_FOLDER_KEY)
		.then(() => true)
		.catch(() => false);
}
