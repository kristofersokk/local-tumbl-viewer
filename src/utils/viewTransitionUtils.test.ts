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
		const startViewTransition = vi.fn();
		vi.stubGlobal('document', {
			...document,
			startViewTransition,
		});

		const callback = vi.fn();
		withViewTransition(callback);

		expect(startViewTransition).toHaveBeenCalledWith(callback);
	});
});
