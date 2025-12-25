const cache = new Map<string, unknown>();

export const CACHES = {
	ROOT_FOLDER: 'root-folder',
} as const;

type CacheName = (typeof CACHES)[keyof typeof CACHES];

type NotUndefined<T> = T extends undefined ? never : T;

export const cacheValueAsync = async <T>(
	key: CacheName | (string & {}),
	valueSupplier: () => Promise<NotUndefined<T>>
) => {
	const value = (cache as Map<string, T | undefined>).get(key);
	if (value !== undefined) {
		return { value: value as T, fromCache: true, error: undefined };
	}
	try {
		const newValue = await valueSupplier();
		cache.set(key, newValue);
		return { value: newValue, fromCache: false, error: undefined };
	} catch (error) {
		return { value: undefined, fromCache: false, error };
	}
};

export const clearCacheValue = (key: CacheName & (string & {})) => {
	cache.delete(key);
};

export function dedupeTask<T>(
	key: string,
	taskSupplier: () => Promise<T>
): Promise<T> {
	const cacheKey = `task-${key}`;
	const hit = cache.get(cacheKey) as Promise<T> | undefined;
	if (hit) return hit; // fast-path: already running

	const promise = taskSupplier().finally(() => cache.delete(cacheKey)); // clean-up on settle
	cache.set(cacheKey, promise);
	return promise;
}
