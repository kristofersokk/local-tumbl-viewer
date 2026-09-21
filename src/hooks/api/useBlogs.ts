import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import { jsonrepair } from 'jsonrepair';
import { useState } from 'react';
import { BlogEntry, BlogFileEntries, BlogMetadata } from 'Types/blog';
import { processBlog } from 'Utils/blogUtils';

const useBlogs = (indexFolder: FileSystemDirectoryHandle | undefined) => {
	const [erroredFileNames, setErroredFileNames] = useState<string[]>([]);

	const query = useQuery({
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
						const failedFileNames: string[] = [];
						const acquiredBlogs = (
							await Promise.all(
								metadataFiles.map(async file => {
									const lastPeriodIndex = file.name.lastIndexOf('.');
									const fileEntriesFileName = `${file.name.slice(0, lastPeriodIndex)}_files.${file.name.slice(lastPeriodIndex + 1)}`;
									const fileEntriesFile = files.find(
										file => file.name === fileEntriesFileName
									);
									if (!fileEntriesFile) {
										failedFileNames.push(file.name);
										return undefined;
									}
									const [metadata, fileEntries] = await Promise.all([
										file
											.getFile()
											.then(file => file.text())
											.then(text => {
												try {
													return JSON.parse(text) as BlogMetadata;
													// oxlint-disable-next-line @typescript-eslint/no-unused-vars
												} catch (ignored) {
													console.log(`Repairing JSON for ${file.name}`);
													return JSON.parse(jsonrepair(text)) as BlogMetadata;
												}
											})
											.then(processBlog)
											.catch((e: unknown) => {
												console.error(`Error reading ${file.name}:`, e);
												failedFileNames.push(file.name);
												return undefined;
											}),
										fileEntriesFile
											.getFile()
											.then(file => file.text())
											.then(text => {
												try {
													return JSON.parse(text) as BlogFileEntries;
													// oxlint-disable-next-line @typescript-eslint/no-unused-vars
												} catch (ignored) {
													console.log(
														`Repairing JSON for ${fileEntriesFile.name}`
													);
													return JSON.parse(
														jsonrepair(text)
													) as BlogFileEntries;
												}
											})
											.catch((e: unknown) => {
												console.error(
													`Error reading ${fileEntriesFile.name}:`,
													e
												);
												failedFileNames.push(fileEntriesFile.name);
												return undefined;
											}),
									]);
									if (!metadata || !fileEntries) return undefined;

									return {
										metadata,
										fileEntries,
									} satisfies BlogEntry as BlogEntry;
								})
							)
						).filter(blog => blog !== undefined);

						setErroredFileNames(failedFileNames);

						return acquiredBlogs;
					})
			: skipToken,
		staleTime: Infinity,
	});

	return {
		data: query.data,
		isFetching: query.isFetching,
		erroredFileNames,
	};
};

export default useBlogs;
