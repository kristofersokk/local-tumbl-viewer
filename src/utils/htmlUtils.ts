import { EventCollector } from 'Helpers/eventCollector';

export type DomProcessor = (el: HTMLElement, callback: Callback) => void;
export type DomProcessorAsync = (el: HTMLElement) => Promise<void>;

export async function iterateDomTree(
	el: HTMLElement,
	processor: DomProcessor,
	eventCollector: EventCollector,
	currentPath: string = 'root'
): Promise<void> {
	if (!el) return;

	processor(el, eventCollector?.registerInput(currentPath));

	Array.from(el.children).map((child, index) =>
		iterateDomTree(
			child as HTMLElement,
			processor,
			eventCollector,
			currentPath + '.' + index
		)
	);
}

export async function iterateDomTreeAsync(
	el: HTMLElement,
	processor: DomProcessorAsync
): Promise<void> {
	if (!el) return;

	return Promise.all([
		processor(el),
		...Array.from(el.children).map(child =>
			iterateDomTreeAsync(child as HTMLElement, processor)
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
