let indexedDb: IDBDatabase | undefined = undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let indexedDbError: Event | undefined = undefined;

const ROOT_FOLDER_KEY = 'rootFolder';

export async function getPermittedRootDirectoryHandle() {
	const dirHandle = await getRootDirectoryHandle();
	if (!dirHandle) {
		console.error('No root directory handle found');
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
	if (permission === 'prompt') {
		return promptForRootDirectoryHandle();
	}

	console.error('No read permission granted for root directory');
	return undefined;
}

async function getRootDirectoryHandle() {
	const dirHandle = await retrieveFileHandle(ROOT_FOLDER_KEY);
	if (dirHandle) {
		return dirHandle;
	}

	return promptForRootDirectoryHandle();
}

async function promptForRootDirectoryHandle() {
	const newDirHandle: FileSystemDirectoryHandle =
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		await window.showDirectoryPicker({
			id: ROOT_FOLDER_KEY,
		});
	await storeFileHandle(ROOT_FOLDER_KEY, newDirHandle);

	return newDirHandle;
}

async function storeFileHandle(key: string, handle: FileSystemHandle) {
	await openDatabaseIfNotOpen();

	const request = indexedDb!
		.transaction('fileHandles', 'readwrite')
		.objectStore('fileHandles')
		.put(handle, key);

	return new Promise<void>((resolve, reject) => {
		request.onsuccess = () => {
			console.log('File handle stored in IndexedDB');
			resolve();
		};
		request.onerror = () => {
			reject(request.error);
		};
	});
}

async function retrieveFileHandle(key: string) {
	await openDatabaseIfNotOpen();

	const request = indexedDb!
		.transaction('fileHandles', 'readonly')
		.objectStore('fileHandles')
		.get(key);

	return new Promise<FileSystemHandle | undefined>((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onerror = () => {
			reject(request.error);
		};
	});
}

async function openDatabaseIfNotOpen() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		if (!indexedDb) {
			const request = indexedDB.open('local-tumbl-viewer', 1);
			request.onerror = event => {
				indexedDbError = event;
				reject(event);
			};
			request.onsuccess = event => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				indexedDb = event.target!.result;
				resolve(indexedDb!);
			};
			request.onupgradeneeded = event => {
				const db = (event.target! as unknown as { result: IDBDatabase }).result;
				db.createObjectStore('fileHandles');
			};
		} else {
			resolve(indexedDb);
		}
	});
}
