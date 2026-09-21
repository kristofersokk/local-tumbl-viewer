import { flushSync } from 'react-dom';

// document.startViewTransition is not supported by every Chromium version that
// supports the File System Access API this app requires, so it needs a fallback.
export function withViewTransition(callback: () => void) {
	if (document.startViewTransition) {
		return document.startViewTransition(() => {
			flushSync(callback);
		});
	} else {
		callback();
		return undefined;
	}
}

export function getMediaViewTransitionName(mediaName: string) {
	const encodedName = Array.from(mediaName)
		.map(character => character.codePointAt(0)?.toString(36) ?? '0')
		.join('-');
	return `media-${encodedName}`;
}
