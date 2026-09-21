import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { withViewTransition } from './viewTransitionUtils';

describe('withViewTransition', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('calls the callback synchronously when startViewTransition is unsupported', () => {
		vi.stubGlobal('document', {
			...document,
			startViewTransition: undefined,
		});

		const callback = vi.fn();
		withViewTransition(callback);

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('delegates to document.startViewTransition when supported', () => {
		let transitionCallback: (() => void) | undefined;
		const startViewTransition = vi.fn((callback: () => void) => {
			transitionCallback = callback;
		});
		vi.stubGlobal('document', {
			...document,
			startViewTransition,
		});

		const callback = vi.fn();
		withViewTransition(callback);
		transitionCallback?.();

		expect(startViewTransition).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledTimes(1);
	});
});
