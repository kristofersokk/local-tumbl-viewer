const cache = {} as Record<string, unknown>;

export const CACHES = {
	ROOT_FOLDER: 'root-folder',
} as const;

type CacheName = (typeof CACHES)[keyof typeof CACHES];

export const cacheValueAsync = async <T>(
	key: CacheName | (string & {}),
	valueSupplier: () => Promise<T>
) => {
	const value = (cache as Record<string, T | undefined>)[key];
	if (value !== undefined) {
		return value;
	}
	const newValue = await valueSupplier();
	cache[key] = newValue;
	return newValue;
};

export const clearCacheValue = (key: CacheName & (string & {})) => {
	delete cache[key];
};
