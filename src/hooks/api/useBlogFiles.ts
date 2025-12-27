import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';

const useBlogFiles = (blogFolder: FileSystemDirectoryHandle | undefined) => {
	return useQuery({
		queryKey: [QUERY_KEYS.BLOG_FILES, blogFolder?.name],
		queryFn: blogFolder
			? async () =>
					Array.fromAsync(blogFolder.values()).then(handles =>
						handles
							.filter(
								(handle): handle is FileSystemFileHandle =>
									handle.kind === 'file'
							)
							.map(handle => ({
								handle,
								name: handle.name,
							}))
					)
			: skipToken,
		staleTime: Infinity,
	});
};

export default useBlogFiles;
