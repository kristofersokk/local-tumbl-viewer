import { useCallback } from 'react';
import { BlogFileEntry } from 'Types/blog';
import { getMediaFileHandle } from 'Utils/blogUtils';
import { cacheValueAsync } from 'Utils/cacheUtils';

const useTransformMediaUrl = ({
	imageUrlsCache,
	fallbackToOnlineMedia,
	generatedObjectUrls,
	imgMappingEntries,
	blogFiles,
	blogName,
}: {
	imageUrlsCache: Record<string, { online?: string; local?: string }>;
	fallbackToOnlineMedia: boolean;
	generatedObjectUrls: string[];
	imgMappingEntries: BlogFileEntry[];
	blogFiles: FileSystemFileHandle[];
	blogName: string;
}) => {
	const constructLocalUrl = useCallback(
		async (urls: string[]) => {
			const { url: onlineUrl, fileHandle: mediaFileHandle } = urls
				.map(url => ({
					url,
					fileHandle: getMediaFileHandle(imgMappingEntries, blogFiles, url),
				}))
				.find(file => !!file.fileHandle) ?? {
				url: undefined,
				fileHandle: undefined,
			};
			let localUrl: string | undefined = undefined;
			if (mediaFileHandle) {
				const cacheKey = `mediaFile-${blogName}-${mediaFileHandle.name}`;
				const mediaFile = await cacheValueAsync(cacheKey, () =>
					mediaFileHandle.getFile()
				);
				localUrl = URL.createObjectURL(mediaFile);
				generatedObjectUrls.push(localUrl);
			}

			return { onlineUrl, localUrl };
		},
		[blogFiles, blogName, generatedObjectUrls, imgMappingEntries]
	);

	return useCallback(
		async (inputUrls: string | string[]) => {
			const urls = Array.isArray(inputUrls)
				? inputUrls.filter(Boolean)
				: [inputUrls];
			const firstUrl = urls[0];
			if (!firstUrl) return { original: '', transformed: '' };

			const cachedValue = imageUrlsCache[firstUrl];
			if (cachedValue)
				return {
					original: cachedValue.online!,
					transformed:
						cachedValue.local ||
						(fallbackToOnlineMedia
							? cachedValue.online || 'unknown'
							: 'unknown'),
				};

			const { onlineUrl, localUrl } = await constructLocalUrl(urls);

			imageUrlsCache[firstUrl] = {
				online: onlineUrl || firstUrl,
				local: localUrl,
			};
			return {
				original: onlineUrl || firstUrl,
				transformed: localUrl || (fallbackToOnlineMedia ? firstUrl : 'unknown'),
			};
		},
		[imageUrlsCache, fallbackToOnlineMedia, constructLocalUrl]
	);
};

export default useTransformMediaUrl;
