// document.startViewTransition is not supported by every Chromium version that
// supports the File System Access API this app requires, so it needs a fallback.
export function withViewTransition(callback: () => void) {
	if (document.startViewTransition) {
		document.startViewTransition(callback);
	} else {
		callback();
	}
}
