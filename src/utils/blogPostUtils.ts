import { fileExtensions } from 'Constants/file';
import { BlogFileEntry, ProcessedBlogPost } from 'Types/blog';

import { DomProcessor, extractUrls, modifyAttribute } from './htmlUtils';

export const countCollapsedTags = (
	post: ProcessedBlogPost,
	maxChars: number
) => {
	const tags = post.tags || [];
	let currentChars = 0;
	let count = 0;

	for (const tag of tags) {
		const tagChars = tag.length;
		currentChars += tagChars + 2;
		count++;
		if (currentChars > maxChars) {
			break;
		}
	}

	return count;
};

const ALLOW_FULLSCREEN = true;

export const getBlogPostProcessors = (
	transformMediaUrl: (imageUrl: string | string[]) => Promise<{
		original: string;
		transformed: string;
	}>
): DomProcessor[] => [
	async el => {
		const tag = el.tagName.toLowerCase();
		if (tag === 'a') {
			el.setAttribute('target', '_blank');
			el.setAttribute('rel', 'noopener noreferrer');
		}
		if (tag === 'img') {
			const imageEl = el as HTMLImageElement;
			const parentEl = imageEl.parentElement;
			const parentUrls = Array.from(parentEl?.attributes || [])
				.filter(attr => ['data-big-photo'].includes(attr.name))
				.filter(attr => attr.value.includes('https://'))
				.map(attr => attr.value);
			const srcsetUrls = extractUrls(imageEl.srcset).toReversed();
			const urls = [
				imageEl.getAttribute('data-src') || '',
				...srcsetUrls,
				imageEl.src,
				...parentUrls,
			].filter(url => !!url);

			imageEl.removeAttribute('src');
			imageEl.removeAttribute('srcset');
			const { original, transformed } = await transformMediaUrl(urls);
			modifyAttribute(imageEl, 'data-src', original);
			modifyAttribute(imageEl, 'src', transformed);
		}
		if (tag === 'source') {
			const sourceEl = el as HTMLSourceElement;
			const src = sourceEl.src;
			sourceEl.removeAttribute('src');
			const { original, transformed } = await transformMediaUrl([src]);
			modifyAttribute(sourceEl, 'data-src', original);
			modifyAttribute(sourceEl, 'src', transformed);
		}
		if (tag === 'video') {
			const videoEl = el as HTMLVideoElement;
			const src = videoEl.src || videoEl.getAttribute('data-src') || '';
			videoEl.removeAttribute('src');
			videoEl.removeAttribute('data-src');
			const { original: original1, transformed: transformed1 } =
				await transformMediaUrl(src);
			modifyAttribute(videoEl, 'data-src', original1);
			modifyAttribute(videoEl, 'src', transformed1 || undefined);

			const poster = videoEl.poster;
			videoEl.removeAttribute('poster');
			const { original: original2, transformed: transformed2 } =
				await transformMediaUrl(poster);
			modifyAttribute(videoEl, 'data-poster', original2);
			modifyAttribute(videoEl, 'poster', transformed2 || undefined);

			videoEl.setAttribute('autoplay', 'true');
			videoEl.setAttribute('muted', 'true');
			videoEl.setAttribute('loop', 'true');
			videoEl.setAttribute('controls', 'true');
			videoEl.setAttribute(
				'controlsList',
				'' + (ALLOW_FULLSCREEN ? '' : 'nofullscreen')
			);
		}
		if (tag === 'iframe') {
			const iframeEl = el as HTMLIFrameElement;
			iframeEl.style.width = '100%';
			iframeEl.style.aspectRatio = '16/9';
			iframeEl.style.height = 'auto';
			iframeEl.setAttribute('loading', 'lazy');
			iframeEl.setAttribute(
				'allow',
				'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
			);
			if (ALLOW_FULLSCREEN) {
				iframeEl.setAttribute('allowfullscreen', 'true');
			} else {
				iframeEl.removeAttribute('allowfullscreen');
			}
			iframeEl.setAttribute('frameborder', '0');
			iframeEl.setAttribute('scrolling', 'no');
		}
		if (tag === 'blockquote') {
			const blockQuoteEl = el as HTMLQuoteElement;
			const parentEl = blockQuoteEl.parentElement;
			const firstSibling = parentEl?.firstElementChild;
			if (parentEl && firstSibling) {
				const hasSecondChildBlockQuote =
					blockQuoteEl.children.length >= 2 &&
					blockQuoteEl.children[1].tagName.toLowerCase() === 'blockquote';
				if (hasSecondChildBlockQuote) {
					if (blockQuoteEl.children.length >= 3) {
						const children = Array.from(blockQuoteEl.children);
						for (let i = 2; i < children.length; i++) {
							parentEl.insertBefore(children[i], blockQuoteEl);
						}
					}
					if (parentEl.tagName.toLowerCase() === 'blockquote') {
						parentEl.parentNode?.insertBefore(blockQuoteEl, parentEl);
					} else {
						parentEl?.insertBefore(blockQuoteEl, firstSibling);
					}
				} else {
					const children = Array.from(blockQuoteEl.children);
					for (let i = 0; i < children.length; i++) {
						parentEl.insertBefore(children[i], blockQuoteEl);
					}
					blockQuoteEl.remove();
				}
			}
		}
	},
];

function getAlternativeExtensions(extension: string): string[] {
	for (const group of Object.values(fileExtensions)) {
		if (group.includes(extension.toLowerCase())) {
			return group;
		}
	}
	return [];
}

function getAlternativeFileNames(fileName: string | undefined): string[] {
	if (!fileName || !fileName.includes('.')) return [fileName || ''];

	const lastIndexOfDot = fileName.lastIndexOf('.');
	const fileNameWithoutExtension = fileName.slice(0, lastIndexOfDot);
	const extension = fileName.slice(lastIndexOfDot + 1).toLowerCase();
	const alternativeFileNames = (getAlternativeExtensions(extension) || []).map(
		ext => `${fileNameWithoutExtension}.${ext}`
	);

	return [fileName, ...alternativeFileNames];
}

export function getMediaFileHandle(
	imgMappingEntries: BlogFileEntry[],
	blogFiles: { handle: FileSystemFileHandle; name: string }[],
	url: string
) {
	const lastSlashIndex = url.lastIndexOf('/');
	const urlFileName =
		lastSlashIndex === -1 ? url : url.slice(lastSlashIndex + 1);
	const differentResolutionEntry = imgMappingEntries?.find(
		({ O: originalFileName }) => originalFileName === urlFileName
	);
	const originalResolutionEntry = imgMappingEntries?.find(
		({ L: unChangedFileName }) => unChangedFileName === urlFileName
	);
	const newFileNames = [
		differentResolutionEntry?.F,
		differentResolutionEntry?.L,
		differentResolutionEntry?.O,
		originalResolutionEntry?.F,
		originalResolutionEntry?.L,
		originalResolutionEntry?.O,
		urlFileName,
	];
	// F types have chance of having same filename, but different extension, so we need to consider them last
	const newFileNamesForExtendedSearch = [
		differentResolutionEntry?.O,
		differentResolutionEntry?.L,
		originalResolutionEntry?.O,
		originalResolutionEntry?.L,
		differentResolutionEntry?.F,
		originalResolutionEntry?.F,
		urlFileName,
	];
	const possibleFileNames = newFileNames;
	const extendedPossibleFileNames = newFileNamesForExtendedSearch.flatMap(
		getAlternativeFileNames
	);
	const mediaFile =
		blogFiles.find(file => possibleFileNames.includes(file.name)) ??
		blogFiles.find(file => extendedPossibleFileNames.includes(file.name));
	return mediaFile;
}
