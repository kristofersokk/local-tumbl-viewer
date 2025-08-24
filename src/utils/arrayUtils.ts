export function deduplicateArray<T>(array: T[]): T[] {
	return Array.from(new Set<T>(array));
}
