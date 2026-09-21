import { useCallback } from 'react';

import { BlogFileEntry, CombinedBlogPost } from 'Types/blog';
import { getMediaFileHandles } from 'Utils/blogPostUtils';
import { cacheValueAsync, dedupeTask } from 'Utils/cacheUtils';

const useTransformMediaUrl = ({
	fallbackToOnlineMedia,
	imgMappingEntries,
	blogFiles,
	blogName,
	sortedMedia,
}: {
	fallbackToOnlineMedia: boolean;
	imgMappingEntries: BlogFileEntry[];
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	blogName: string;
	sortedMedia: {
		post: CombinedBlogPost;
		name: string;
		type: 'image' | 'video';
	}[];
}) => {
	const constructLocalUrl = useCallback(
		async (urls: string[]) =>
			cacheValueAsync(
				'BLOG_PROCESSING',
				`constructLocalUrl-${blogName}-${urls.join(',')}-${fallbackToOnlineMedia}`,
				async () => {
					if (urls.length === 0) {
						throw new Error('No URLs provided to constructLocalUrl');
					}
					const { url: onlineUrl, fileHandles: mediaFileHandles } = urls
						.map(url => ({
							url,
							fileHandles: getMediaFileHandles(
								imgMappingEntries,
								blogFiles,
								url
							),
						}))
						.find(file => file.fileHandles?.length) ?? {
						url: urls[0],
						fileHandles: undefined,
					};
					if (mediaFileHandles?.length) {
						const firstMediaFileHandle = mediaFileHandles[0];
						const cacheKey = `constructLocalUrl-localUrl-${blogName}-${firstMediaFileHandle.name}`;
						const { value: localUrl } = await cacheValueAsync(
							'BLOG_PROCESSING',
							cacheKey,
							async () => {
								const mediaFile = await firstMediaFileHandle.handle.getFile();
								return URL.createObjectURL(mediaFile);
							}
						);
						return {
							onlineUrl,
							localUrl,
							localFileNames: mediaFileHandles.map(
								fileHandle => fileHandle.name
							),
						};
					}

					return { onlineUrl, localUrl: undefined, localFileNames: undefined };
				}
			),
		[fallbackToOnlineMedia, blogFiles, blogName, imgMappingEntries]
	);

	return useCallback(
		async (inputUrls: string | string[]) =>
			dedupeTask(
				`transformMediaUrl-${blogName}-${Array.isArray(inputUrls) ? inputUrls.join(',') : inputUrls}-${fallbackToOnlineMedia}`,
				async () => {
					const urls = Array.isArray(inputUrls)
						? inputUrls.filter(Boolean)
						: [inputUrls];
					const firstUrl = urls[0];
					if (!firstUrl) return { original: '', transformed: '' };

					const { value, error } = await constructLocalUrl(urls);
					if (!value) {
						throw error;
					}
					const { onlineUrl, localUrl, localFileNames } = value;

					return {
						original: onlineUrl,
						transformed:
							localUrl || (fallbackToOnlineMedia ? firstUrl : 'unknown'),
						localFileNames,
						mediaFileName: sortedMedia.find(media =>
							localFileNames?.includes(media.name)
						)?.name,
					};
				}
			),
		[fallbackToOnlineMedia, blogName, constructLocalUrl]
	);
};

export default useTransformMediaUrl;
