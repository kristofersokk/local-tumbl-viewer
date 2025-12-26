import {
	BlogFileEntry,
	BlogMetadata,
	BlogType,
	CombinedBlogPost,
	getBlogTypeIndex,
	Platform,
	ProcessedBlogPost,
	RawBlogPost,
} from 'Types/blog';
import { deduplicateArray } from './arrayUtils';

export function getBlogFolderName(blog: BlogMetadata | undefined) {
	if (!blog) return undefined;

	const lastIndexOfBackSlash = blog?.FileDownloadLocation?.lastIndexOf('\\');
	const lastIndexOfSlash = blog?.FileDownloadLocation?.lastIndexOf('/');
	if (lastIndexOfBackSlash === undefined || lastIndexOfSlash === undefined)
		return blog.Name;

	const lastIndexOfSeparator = Math.max(lastIndexOfBackSlash, lastIndexOfSlash);
	return blog?.FileDownloadLocation?.substring(lastIndexOfSeparator + 1);
}

export const getPlatformFromBlogType = (blogType: BlogType): Platform =>
	(
		[
			'tumblr',
			'tumblr',
			'instagram',
			'twitter',
			'tumblr',
			'tumblr',
			'tumblr',
			'newtumbl',
			'bluesky',
			'unknown',
		] satisfies Platform[] as Platform[]
	)[blogType] || 'unknown';

export const processBlog = (blog: BlogMetadata): BlogMetadata => {
	const platform = getPlatformFromBlogType(blog.BlogType);
	return { ...blog, platform } satisfies BlogMetadata;
};

const transformPostUrl = (url: string | undefined) => {
	if (!url) return url;

	const regex = /https:\/\/(.+?)\.tumblr\.com\/post\/(.+)/;
	const match = url.match(regex);
	if (match) {
		const blogName = match[1];
		const postId = match[2];
		return `https://tumblr.com/${blogName}/${postId}`;
	}
	return url;
};

const calculatedCreatedAt = (post: RawBlogPost): Date | undefined => {
	if (post.platform === 'bluesky') {
		return new Date(post.date);
	}

	if (post.platform === 'twitter') {
		return new Date(post.date);
	}

	if (post.platform !== 'tumblr') {
		return undefined;
	}

	// Tumblr
	const timestampStr =
		post.date || post['date-gmt'] || post.timestamp || post['unix-timestamp'];
	if (!timestampStr) return undefined;

	let createdAt: number | undefined = undefined;
	if (typeof timestampStr === 'number') {
		createdAt = timestampStr;
	} else if (/^\d+$/.test(timestampStr)) {
		createdAt = parseInt(timestampStr, 10);
	} else {
		const date = new Date(timestampStr);
		const year = date.getFullYear();
		if (year > 2000) {
			createdAt = date.getTime();
		}
	}
	if (createdAt && createdAt < 1_000_000_000_000) {
		createdAt = createdAt * 1000;
	}
	return createdAt ? new Date(createdAt) : undefined;
};

type Photos = NonNullable<ProcessedBlogPost['photo']>['photos'];

function getPhotos(post: RawBlogPost): Photos {
	if (post.platform !== 'tumblr') {
		return [];
	}

	const photos: Photos = [];

	(post.photos || [])
		.map(photo => ({
			urls: [
				photo['photo-url-1280'],
				photo['photo-url-500'],
				photo['photo-url-400'],
				photo['photo-url-250'],
				photo['photo-url-100'],
				photo['photo-url-75'],
			].filter(Boolean),
			caption: photo.caption,
		}))
		.filter(({ urls }) => urls.length > 0)
		.forEach(photoObj => photos.push(photoObj));

	if (post.photoset_layout && post.photoset_photos) {
		const expandedLayout: number[] = [];
		for (const char of post.photoset_layout) {
			const span = parseInt(char, 10);
			for (let i = 0; i < span; i++) {
				expandedLayout.push(span);
			}
		}
		post.photoset_photos.forEach((photo, index) => {
			photos.push({
				urls: [photo.high_res, photo.low_res].filter(Boolean),
				layoutSpan: expandedLayout[index],
			});
		});
	}

	if (!photos.length) {
		const singlePhotoUrls = [
			post['photo-url-1280'],
			post['photo-url-500'],
			post['photo-url-400'],
			post['photo-url-250'],
			post['photo-url-100'],
			post['photo-url-75'],
		].filter(Boolean);
		if (singlePhotoUrls.length > 0) {
			const caption =
				post.photo_caption || post['photo-caption'] || post.caption;
			photos.push({ urls: singlePhotoUrls, caption });
		}
	}

	return photos;
}

const detectBlogMediaFiles = (
	post: RawBlogPost,
	blogFileNames: string[] | undefined
) => {
	const emptyMediaFiles = {
		images: [],
		videos: [],
	};

	if (!('id' in post)) return emptyMediaFiles;
	if (!blogFileNames) return emptyMediaFiles;

	const imageExtensions = getAlternativeExtensions('jpg');
	const videoExtensions = getAlternativeExtensions('mp4');

	const getMediaFiles = (extensions: string[]) =>
		blogFileNames.filter(fileName => {
			const fileNameWithoutExtension = fileName.includes('.')
				? fileName.slice(0, fileName.lastIndexOf('.'))
				: fileName;
			const extension = fileName.includes('.')
				? fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
				: '';
			return (
				fileNameWithoutExtension.startsWith(post.id) &&
				extensions.includes(extension)
			);
		});

	const imageFileNames = getMediaFiles(imageExtensions);
	const videoFileNames = getMediaFiles(videoExtensions);

	return {
		images: imageFileNames,
		videos: videoFileNames,
	};
};

const replaceLinks = (text: string, links?: Record<string, string>): string => {
	if (!links || Object.keys(links).length === 0) return text;

	let replacedText = text;
	for (const [key, value] of Object.entries(links)) {
		replacedText = replacedText.replace(
			key,
			`<a href="${value}" target="_blank" rel="noopener noreferrer">${key}</a>`
		);
	}
	return replacedText;
};

export const processBlogPost = (
	post: RawBlogPost,
	blogMetadata: BlogMetadata | undefined,
	blogFileNames: string[] | undefined
): ProcessedBlogPost => {
	if (post.platform === 'bluesky') {
		const mediaFiles = detectBlogMediaFiles(post, blogFileNames) || {};
		return {
			platform: 'bluesky',
			type: 'regular',
			id: post.id,
			url: post.url,
			body: {
				content: htmlifyText(post.text),
				isDisabled: false,
				showMediaFiles: false,
			},
			createdAt: calculatedCreatedAt(post),
			tags: [],
			mediaFiles,
		};
	}

	if (post.platform === 'twitter') {
		const mediaFiles = detectBlogMediaFiles(post, blogFileNames) || {};
		const text = replaceLinks(post.text, post.links);
		return {
			platform: 'twitter',
			type: 'regular',
			id: post.id,
			url: post.url,
			body: {
				content: htmlifyText(text),
				isDisabled: false,
				showMediaFiles: false,
			},
			createdAt: calculatedCreatedAt(post),
			tags: [],
			mediaFiles,
		};
	}

	if (post.platform !== 'tumblr') {
		return {
			platform: post.platform,
			type: 'regular',
			tags: [],
			mediaFiles: {
				images: [],
				videos: [],
			},
		};
	}

	const mediaFiles = detectBlogMediaFiles(post, blogFileNames) || {};
	const photos = getPhotos(post);
	const isBodyDisabled = !!photos.length;

	const rawBody = removeUnneededPatterns(
		undoubleText(
			post.post_html ||
				post['post-html'] ||
				post.regular_body ||
				post['regular-body'] ||
				post.body ||
				''
		)
	).trim();
	const bodyIncludesMediaExtensions = alternativeExtensions
		.flatMap(it => it)
		.some(ext => (rawBody || '').includes('.' + ext));
	const answerIncludesMediaExtensions = alternativeExtensions
		.flatMap(it => it)
		.some(ext => (post.answer || '').includes('.' + ext));
	const showMediaFiles =
		post.platform !== 'tumblr' ||
		(post.platform === 'tumblr' &&
			(blogMetadata?.BlogType === getBlogTypeIndex('tumblrsearch') ||
				(!bodyIncludesMediaExtensions && !answerIncludesMediaExtensions)));

	return {
		platform: 'tumblr',
		id: post.id,
		type: post.type || 'regular',
		createdAt: calculatedCreatedAt(post),
		title: removeUnneededPatterns(
			undoubleText(post.regular_title || post['regular-title'] || post.title)
		),
		url: transformPostUrl(post['url-with-slug'] || post.url || post.post_url),
		tags: post.tags || [],
		mediaFiles,
		body: {
			content: htmlifyText(rawBody),
			isDisabled: isBodyDisabled,
			showMediaFiles,
		},
		photo: post.type === 'photo' ? { photos } : undefined,
		video:
			post.type === 'video'
				? {
						caption: post['video-caption'] || post.video_caption || '',
						source: post['video-source'] || post.video_source || '',
					}
				: undefined,
		quote:
			post.type === 'quote'
				? {
						quote: post['quote-text'] || post.quote_text || '',
						source: post['quote-source'] || post.quote_source || '',
					}
				: undefined,
		answer:
			post.type === 'answer'
				? {
						question: post.question || '',
						answer: post.answer || '',
					}
				: undefined,
		conversation:
			post.type === 'conversation'
				? {
						title:
							post.conversation_title ||
							post['conversation-title'] ||
							undefined,
						utterances: post.conversation || [],
					}
				: undefined,
		link:
			post.type === 'link'
				? {
						url: post.link_url || post['link-url'] || '',
						text: post.link_text || post['link-text'] || '',
						description:
							post.link_description || post['link-description'] || '',
					}
				: undefined,
		summary: post.summary,
		rebloggedFrom: post['reblogged-from-name'] || post.reblogged_from_name,
		rebloggedRoot: post['reblogged-root-name'] || post.reblogged_root_name,
	} satisfies ProcessedBlogPost;
};

export const countAllTags = (
	posts: CombinedBlogPost[]
): { tag: string; count: number }[] => {
	const allTags = deduplicateArray(
		posts.flatMap(post => post.processed.tags || [])
	);
	return allTags.map(tag => {
		const count = posts.filter(p => p.processed.tags.includes(tag)).length;
		return {
			tag,
			count,
		};
	});
};

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

export type DomProcessor = (el: HTMLElement) => Promise<void>;

export const iterateDomTree = async (
	el: HTMLElement,
	processor: DomProcessor
): Promise<void> => {
	if (!el) return;

	return Promise.all([
		processor(el),
		...Array.from(el.children).map(child =>
			iterateDomTree(child as HTMLElement, processor)
		),
	]).then(() => {});
};

export function extractUrls(input: string): string[] {
	const urlRegex = /https?:\/\/[^\s]+/g;
	return input.match(urlRegex) || [];
}

export const modifyAttribute = (
	el: HTMLElement,
	attrName: string,
	value: string | undefined
) => {
	if (value !== undefined) {
		el.setAttribute(attrName, value);
	} else {
		el.removeAttribute(attrName);
	}
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
	},
];

const alternativeExtensions: string[][] = [
	[
		// images
		'jpeg',
		'jpg',
		'png',
		'webp',
		'gif',
		'bmp',
		'tiff',
		'svg',
		'heic',
		'avif',
		'jfif',
		'apng',
		'ico',
	],
	[
		// videos
		'mp4',
		'mov',
		'avi',
		'mkv',
		'flv',
		'wmv',
		'webm',
		'mpeg',
		'mpg',
		'3gp',
		'ogg',
		'm4v',
	],
];

export const getAlternativeExtensions = (extension: string): string[] => {
	for (const group of alternativeExtensions) {
		if (group.includes(extension.toLowerCase())) {
			return group;
		}
	}
	return [];
};

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
	blogFiles: FileSystemFileHandle[],
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

export const filterBlogPostsByFuzzySearch = (
	posts: CombinedBlogPost[],
	searchString: string | undefined
): CombinedBlogPost[] => {
	if (!searchString || searchString.trim() === '') return posts;

	const cleanedSearchString = searchString.trim().toLowerCase();
	const searchStringSegments = cleanedSearchString
		.split(' ')
		.filter(s => s.length > 0);

	// TODO: calculate stringified post earlier to improve performance
	return posts.filter(post => {
		const cleanedPostContent = JSON.stringify(post).toLowerCase();
		return searchStringSegments.every(segment =>
			cleanedPostContent.includes(segment)
		);
	});
};

export const undoubleText = <T extends string | undefined>(
	text: T | string
): T | string => {
	if (!text) return text;
	const firstPart = text.slice(0, Math.floor(text.length / 2));
	const replacedText = text.replace(/[\s\r\n]/g, '');
	const replacedFirstPart = firstPart.replace(/[\s\r\n]/g, '');
	if (replacedText === replacedFirstPart + replacedFirstPart) {
		return firstPart;
	}
	return text;
};

const unNeededPatterns = [
	/[^\s]+\/\d{12,}[\s\n\r]*:/g,
	/[^\s]+ reblogged[\s\r\n]+[^\s]+/g,
];

export const removeUnneededPatterns = <T extends string | undefined>(
	text: T | string
): T | string => {
	if (!text) return text;
	let modifiedText = text;
	for (const pattern of unNeededPatterns) {
		modifiedText = modifiedText.replaceAll(pattern, '');
	}
	return modifiedText;
};

export const isHtmlText = (text: string | undefined): boolean => {
	if (!text) return false;
	const htmlPattern = /<\/?[a-z][\s\S]*>/i;
	return htmlPattern.test(text);
};

export const htmlifyText = (text: string): string => {
	if (isHtmlText(text)) return text;
	const htmlifiedText = '<p>' + text.replace(/\n/g, '<br>') + '</p>';
	return htmlifiedText;
};
