import { useCallback } from 'react';
import { BlogFileEntry } from 'Types/blog';
import { getMediaFileHandle } from 'Utils/blogUtils';
import { cacheValueAsync, dedupeTask } from 'Utils/cacheUtils';

const useTransformMediaUrl = ({
	fallbackToOnlineMedia,
	imgMappingEntries,
	blogFiles,
	blogName,
}: {
	fallbackToOnlineMedia: boolean;
	imgMappingEntries: BlogFileEntry[];
	blogFiles: { handle: FileSystemFileHandle; name: string }[];
	blogName: string;
}) => {
	const constructLocalUrl = useCallback(
		async (urls: string[]) =>
			cacheValueAsync(
				'BLOG_PROCESSING',
				`constructLocalUrl-${urls.join(',')}-${fallbackToOnlineMedia}`,
				async () => {
					if (urls.length === 0) {
						throw new Error('No URLs provided to constructLocalUrl');
					}
					const { url: onlineUrl, fileHandle: mediaFileHandle } = urls
						.map(url => ({
							url,
							fileHandle: getMediaFileHandle(imgMappingEntries, blogFiles, url),
						}))
						.find(file => !!file.fileHandle) ?? {
						url: urls[0],
						fileHandle: undefined,
					};
					if (mediaFileHandle) {
						const cacheKey = `constructLocalUrl-localUrl-${blogName}-${mediaFileHandle.name}`;
						const { value: localUrl } = await cacheValueAsync(
							'BLOG_PROCESSING',
							cacheKey,
							async () => {
								const mediaFile = await mediaFileHandle.handle.getFile();
								return URL.createObjectURL(mediaFile);
							}
						);
						return { onlineUrl, localUrl };
					}

					return { onlineUrl, localUrl: undefined };
				}
			),
		[fallbackToOnlineMedia, blogFiles, blogName, imgMappingEntries]
	);

	return useCallback(
		async (inputUrls: string | string[]) =>
			dedupeTask(
				`transformMediaUrl-${Array.isArray(inputUrls) ? inputUrls.join(',') : inputUrls}-${fallbackToOnlineMedia}`,
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
					const { onlineUrl, localUrl } = value;

					return {
						original: onlineUrl,
						transformed:
							localUrl || (fallbackToOnlineMedia ? firstUrl : 'unknown'),
					};
				}
			),
		[fallbackToOnlineMedia, constructLocalUrl]
	);
};

export default useTransformMediaUrl;
