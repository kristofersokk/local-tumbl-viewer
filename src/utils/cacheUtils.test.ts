import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { clearCache, getCacheValue, storeCacheValue } from './cacheUtils';

describe('clearCache', () => {
	afterEach(() => {
		clearCache('BLOG_PROCESSING');
	});

	it('revokes cached blob object URLs before clearing', () => {
		const revokeObjectURL = vi
			.spyOn(URL, 'revokeObjectURL')
			.mockImplementation(() => {});

		storeCacheValue(
			'BLOG_PROCESSING',
			'constructLocalUrl-localUrl-blog-a-photo.jpg',
			'blob:http://localhost/abc'
		);
		storeCacheValue('BLOG_PROCESSING', 'some-non-url-value', 42);

		clearCache('BLOG_PROCESSING');

		expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/abc');
		expect(revokeObjectURL).toHaveBeenCalledTimes(1);
		expect(
			getCacheValue(
				'BLOG_PROCESSING',
				'constructLocalUrl-localUrl-blog-a-photo.jpg'
			)
		).toBeUndefined();
		expect(
			getCacheValue('BLOG_PROCESSING', 'some-non-url-value')
		).toBeUndefined();

		revokeObjectURL.mockRestore();
	});
});
