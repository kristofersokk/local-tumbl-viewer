let indexedDb: IDBDatabase | undefined = undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let indexedDbError: Event | undefined = undefined;

export const OBJECT_STORES = {
	FILE_HANDLES: 'fileHandles',
} as const;

export type ObjectStoreName =
	(typeof OBJECT_STORES)[keyof typeof OBJECT_STORES];

export async function storeValue(
	store: ObjectStoreName,
	key: string,
	handle: FileSystemHandle
) {
	await openDatabaseIfNotOpen();

	const request = indexedDb!
		.transaction(store, 'readwrite')
		.objectStore(store)
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

export async function retrieveValue(store: ObjectStoreName, key: string) {
	await openDatabaseIfNotOpen();

	const request = indexedDb!
		.transaction(store, 'readonly')
		.objectStore(store)
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

export async function openDatabaseIfNotOpen() {
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
