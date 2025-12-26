const caches: Record<CacheName, Map<CacheNameAndKey[CacheName], unknown>> = {
	GLOBAL: new Map(),
	TASKS: new Map(),
	BLOG_PROCESSING: new Map(),
};

export type CacheNameAndKey = {
	GLOBAL: 'root-folder';
	TASKS: string;
	BLOG_PROCESSING: string;
};

type CacheName = keyof CacheNameAndKey;

type NotUndefined<T> = T extends undefined ? never : T;

export const cacheValueAsync = async <CN extends CacheName, T>(
	cacheName: CN,
	key: CacheNameAndKey[CN],
	valueSupplier: () => Promise<NotUndefined<T>>
) => {
	const cache = caches[cacheName];
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

export const clearCache = (cacheName: CacheName) => {
	caches[cacheName].clear();
};

export const clearCacheValue = (
	cacheName: CacheName,
	key: CacheNameAndKey[CacheName]
) => {
	caches[cacheName].delete(key);
};

export function dedupeTask<T>(
	key: string,
	taskSupplier: () => Promise<T>
): Promise<T> {
	const cache = caches.TASKS;
	const cacheKey = `task-${key}`;
	const hit = cache.get(cacheKey) as Promise<T> | undefined;
	if (hit) return hit;

	const promise = taskSupplier().finally(() => cache.delete(cacheKey));
	cache.set(cacheKey, promise);
	return promise;
}
