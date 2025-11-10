import { CACHES, cacheValueAsync, clearCacheValue } from './cacheUtils';
import {
	deleteValue,
	OBJECT_STORES,
	retrieveValue,
	storeValue,
} from './indexedDbUtils';

const ROOT_FOLDER_KEY = 'rootFolder';

export async function getPermittedRootDirectoryHandle(allowPrompt?: boolean) {
	const dirHandle = await getRootDirectoryHandle(allowPrompt);
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
		return promptForRootDirectoryHandle();
	}

	console.error('No read permission granted for root directory');
	return undefined;
}

async function getRootDirectoryHandle(allowPrompt?: boolean) {
	const dirHandle = await cacheValueAsync(CACHES.ROOT_FOLDER, () =>
		retrieveValue(OBJECT_STORES.FILE_HANDLES, ROOT_FOLDER_KEY)
	);
	if (dirHandle) {
		return dirHandle;
	}

	if (allowPrompt) {
		return promptForRootDirectoryHandle();
	}
	return undefined;
}

async function promptForRootDirectoryHandle() {
	console.log('Prompting for root directory handle');
	const newDirHandle: FileSystemDirectoryHandle =
		await window.showDirectoryPicker!({
			id: ROOT_FOLDER_KEY,
			mode: 'read',
			startIn: 'downloads',
		});
	await storeValue(OBJECT_STORES.FILE_HANDLES, ROOT_FOLDER_KEY, newDirHandle);

	return newDirHandle;
}

export async function resetRootDirectoryHandle() {
	clearCacheValue(CACHES.ROOT_FOLDER);
	return deleteValue(OBJECT_STORES.FILE_HANDLES, ROOT_FOLDER_KEY)
		.then(() => true)
		.catch(() => false);
}
