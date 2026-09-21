import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { QUERY_KEYS } from 'Constants/queryKeys';
import { clearCache } from 'Utils/cacheUtils';

// Clears cached blog data and forces the blog to remount via `blogKey`.
const useBlogReload = () => {
	const queryClient = useQueryClient();
	const [blogKey, setBlogKey] = useState(0);

	const reloadBlog = () => {
		clearCache('BLOG_PROCESSING');
		queryClient
			.invalidateQueries({
				predicate: query =>
					[QUERY_KEYS.BLOG_FILES, QUERY_KEYS.BLOG_POSTS].some(
						key => query.queryKey[0] === key
					),
			})
			.then(() => {
				setBlogKey(prev => prev + 1);
			})
			.catch((error: unknown) => {
				console.error('Error reloading blog:', error);
			});
	};

	return { blogKey, reloadBlog };
};

export default useBlogReload;
