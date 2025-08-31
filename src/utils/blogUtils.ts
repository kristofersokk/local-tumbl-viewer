import {
	BlogFileEntry,
	BlogMetadata,
	BlogPost,
	BlogType,
	Platform,
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

const calculatedCreatedAt = (post: BlogPost): Date | undefined => {
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

function getPhotoUrls(post: BlogPost): string[] {
	const singlePhotoUrl =
		post['photo-url-1280'] ||
		post['photo-url-500'] ||
		post['photo-url-400'] ||
		post['photo-url-250'] ||
		post['photo-url-100'] ||
		post['photo-url-75'];
	const multiplePhotoUrls = (post.photos || [])
		.map(
			photo =>
				photo['photo-url-1280'] ||
				photo['photo-url-500'] ||
				photo['photo-url-400'] ||
				photo['photo-url-250'] ||
				photo['photo-url-100'] ||
				photo['photo-url-75']
		)
		.filter(Boolean);
	return singlePhotoUrl ? [singlePhotoUrl] : multiplePhotoUrls;
}

export const processBlogPost = (post: BlogPost): BlogPost => {
	return {
		...post,
		calculated: {
			createdAt: calculatedCreatedAt(post),
			title: post.regular_title || post['regular-title'] || post.title,
			url: transformPostUrl(post['url-with-slug'] || post.url || post.post_url),
			body:
				post.post_html ||
				post['post-html'] ||
				post.photo_caption ||
				post['photo-caption'] ||
				post.caption ||
				post.regular_body ||
				post['regular-body'] ||
				post.body ||
				'',
			photo: post.type === 'photo' ? { urls: getPhotoUrls(post) } : undefined,
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
		},
	} satisfies BlogPost;
};

export const countAllTags = (
	posts: BlogPost[]
): { tag: string; count: number }[] => {
	const allTags = deduplicateArray(posts.flatMap(post => post.tags || []));
	return allTags.map(tag => {
		const count = posts.filter(p => p.tags?.includes(tag)).length;
		return {
			tag,
			count,
		};
	});
};

export const countCollapsedTags = (post: BlogPost, maxChars: number) => {
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
			const src = videoEl.src;
			videoEl.removeAttribute('src');
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
		}
	},
];

const alternativeExtensions: string[][] = [['jpeg', 'jpg', 'png', 'webp']];

function getAlternativeFileNames(fileName: string | undefined): string[] {
	if (!fileName || !fileName.includes('.')) return [fileName || ''];

	const lastIndexOfDot = fileName.lastIndexOf('.');
	const fileNameWithoutExtension = fileName.slice(0, lastIndexOfDot);
	const extension = fileName.slice(lastIndexOfDot + 1).toLowerCase();
	const alternativeFileNames = (
		alternativeExtensions.find(group => group.includes(extension)) || []
	).map(ext => `${fileNameWithoutExtension}.${ext}`);

	return [fileName, ...alternativeFileNames];
}

export function getMediaFileHandle(
	imgMappingEntries: BlogFileEntry[],
	blogFiles: FileSystemFileHandle[],
	url: string
) {
	const lastSlashIndex = url.lastIndexOf('/');
	const urlFileName = url.slice(lastSlashIndex + 1);
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
	];
	const possibleFileNames = newFileNames.flatMap(getAlternativeFileNames);
	const mediaFile = blogFiles.find(file =>
		possibleFileNames.includes(file.name)
	);
	return mediaFile;
}
