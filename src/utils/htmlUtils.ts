export type DomProcessor = (el: HTMLElement) => Promise<void>;

export async function iterateDomTree(
	el: HTMLElement,
	processor: DomProcessor
): Promise<void> {
	if (!el) return;

	return Promise.all([
		processor(el),
		...Array.from(el.children).map(child =>
			iterateDomTree(child as HTMLElement, processor)
		),
	]).then(() => {});
}

export function extractUrls(input: string): string[] {
	const urlRegex = /https?:\/\/[^\s]+/g;
	return input.match(urlRegex) || [];
}

export function modifyAttribute(
	el: HTMLElement,
	attrName: string,
	value: string | undefined
) {
	if (value !== undefined) {
		el.setAttribute(attrName, value);
	} else {
		el.removeAttribute(attrName);
	}
}
