export function deduplicateArray<T, K>(
	array: T[],
	keySelector: (item: T) => K = (item: T) => item as unknown as K
): T[] {
	const seenKeys = new Set<K>();
	const deduplicatedArray: T[] = [];
	for (const item of array) {
		const key = keySelector(item);
		if (!seenKeys.has(key)) {
			seenKeys.add(key);
			deduplicatedArray.push(item);
		}
	}
	return deduplicatedArray;
}

export function shuffleArray<T>(array: T[]): T[] {
	const shuffledArray = array.slice();
	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
	}
	return shuffledArray;
}
