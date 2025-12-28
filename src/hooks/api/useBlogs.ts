import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import { jsonrepair } from 'jsonrepair';
import { BlogEntry, BlogFileEntries, BlogMetadata } from 'Types/blog';
import { processBlog } from 'Utils/blogUtils';

const useBlogs = (indexFolder: FileSystemDirectoryHandle | undefined) => {
	return useQuery({
		queryKey: [QUERY_KEYS.BLOGS, indexFolder?.name],
		queryFn: indexFolder
			? async () =>
					Array.fromAsync(indexFolder.values()).then(async handles => {
						const files = handles.filter(
							(handle): handle is FileSystemFileHandle => handle.kind === 'file'
						);
						const metadataFiles = files.filter(
							file => !file.name.includes('_files')
						);
						const acquiredBlogs = (
							await Promise.all(
								metadataFiles.map(async file => {
									const lastPeriodIndex = file.name.lastIndexOf('.');
									const fileEntriesFileName = `${file.name.slice(0, lastPeriodIndex)}_files.${file.name.slice(lastPeriodIndex + 1)}`;
									const fileEntriesFile = files.find(
										file => file.name === fileEntriesFileName
									);
									if (!fileEntriesFile) return undefined;
									const [metadata, fileEntries] = await Promise.all([
										file
											.getFile()
											.then(file => file.text())
											.then(text => {
												try {
													return JSON.parse(text) as BlogMetadata;
													// eslint-disable-next-line @typescript-eslint/no-unused-vars
												} catch (ignored) {
													console.log(`Repairing JSON for ${file.name}`);
													return JSON.parse(jsonrepair(text)) as BlogMetadata;
												}
											})
											.then(processBlog)
											.catch(() => undefined),
										fileEntriesFile
											.getFile()
											.then(file => file.text())
											.then(text => {
												try {
													return JSON.parse(text) as BlogFileEntries;
													// eslint-disable-next-line @typescript-eslint/no-unused-vars
												} catch (ignored) {
													console.log(
														`Repairing JSON for ${fileEntriesFile.name}`
													);
													return JSON.parse(
														jsonrepair(text)
													) as BlogFileEntries;
												}
											})
											.catch(() => undefined),
									]);
									if (!metadata || !fileEntries) return undefined;

									return {
										metadata,
										fileEntries,
									} satisfies BlogEntry as BlogEntry;
								})
							)
						).filter(blog => blog !== undefined);
						return acquiredBlogs;
					})
			: skipToken,
		staleTime: Infinity,
	});
};

export default useBlogs;
