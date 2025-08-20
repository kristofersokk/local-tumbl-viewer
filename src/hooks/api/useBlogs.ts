import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import { Blog } from 'Types/blog';
import { processBlog } from 'Utils/blogUtils';

const useBlogs = (indexFolder: FileSystemDirectoryHandle | undefined) => {
	return useQuery({
		queryKey: [QUERY_KEYS.BLOGS, indexFolder?.name],
		queryFn: indexFolder
			? async () =>
					Array.fromAsync(
						indexFolder.values() as AsyncIterable<FileSystemHandle>
					).then(async handles => {
						const files = handles
							.filter(
								(handle): handle is FileSystemFileHandle =>
									handle.kind === 'file'
							)
							.filter(file => !file.name.includes('_files'));
						const acquiredBlogs = (
							await Promise.all(
								files.map(file =>
									file
										.getFile()
										.then(file => file.text())
										.then(text => JSON.parse(text) as Blog)
										.then(processBlog)
										.catch(() => undefined)
								)
							)
						).filter(blog => blog !== undefined);
						return acquiredBlogs;
					})
			: skipToken,
		staleTime: Infinity,
	});
};

export default useBlogs;
