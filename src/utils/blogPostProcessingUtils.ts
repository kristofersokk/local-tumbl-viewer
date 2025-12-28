import { allMediaExtensions } from 'Constants/file';
import {
	BlogEntry,
	BlogMetadata,
	CombinedBlogPost,
	getBlogTypeIndex,
	ProcessedBlogPost,
	RawBlogPost,
} from 'Types/blog';

import { cacheValue } from './cacheUtils';

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

function replaceLinks(text: string, links?: Record<string, string>): string {
	if (!links || Object.keys(links).length === 0) return text;

	let replacedText = text;
	for (const [key, value] of Object.entries(links)) {
		replacedText = replacedText.replace(
			key,
			`<a href="${value}" target="_blank" rel="noopener noreferrer">${key}</a>`
		);
	}
	return replacedText;
}

function getBlogPostMediaFiles(
	post: RawBlogPost,
	blogMediaFiles:
		| {
				imagesByPostId: Map<string, string[]>;
				videosByPostId: Map<string, string[]>;
		  }
		| undefined
) {
	const emptyMediaFiles = {
		images: [],
		videos: [],
	};

	if (!('id' in post)) return emptyMediaFiles;
	if (!blogMediaFiles) return emptyMediaFiles;

	return {
		images: blogMediaFiles.imagesByPostId.get(post.id) || [],
		videos: blogMediaFiles.videosByPostId.get(post.id) || [],
	};
}

function undoubleText<T extends string | undefined>(
	text: T | string
): T | string {
	if (!text) return text;
	const firstPart = text.slice(0, Math.floor(text.length / 2));
	const replacedText = text.replace(/[\s\r\n]/g, '');
	const replacedFirstPart = firstPart.replace(/[\s\r\n]/g, '');
	if (replacedText === replacedFirstPart + replacedFirstPart) {
		return firstPart;
	}
	return text;
}

const unNeededPatterns = [
	/[^\s]+\/\d{12,}[\s\n\r]*:/g,
	/[^\s]+ reblogged[\s\r\n]+[^\s]+/g,
];

function removeUnneededPatterns<T extends string | undefined>(
	text: T | string
): T | string {
	if (!text) return text;
	let modifiedText = text;
	for (const pattern of unNeededPatterns) {
		modifiedText = modifiedText.replaceAll(pattern, '');
	}
	return modifiedText;
}

function isHtmlText(text: string | undefined): boolean {
	if (!text) return false;
	const htmlPattern = /<\/?[a-z][\s\S]*>/;
	return htmlPattern.test(text);
}

function htmlifyText(text: string): string {
	if (isHtmlText(text)) return text;
	const htmlifiedText = '<p>' + text.replace(/\n/g, '<br>') + '</p>';
	return htmlifiedText;
}

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

function processBlogPost(
	post: RawBlogPost,
	blogMetadata: BlogMetadata | undefined,
	blogMediaFiles:
		| {
				imagesByPostId: Map<string, string[]>;
				videosByPostId: Map<string, string[]>;
		  }
		| undefined
): ProcessedBlogPost {
	if (post.platform === 'bluesky') {
		const mediaFiles = getBlogPostMediaFiles(post, blogMediaFiles) || {};
		return {
			platform: 'bluesky',
			type: 'regular',
			id: post.id,
			url: post.url,
			body: {
				content: htmlifyText(post.text),
				isDisabled: false,
				showMediaFiles: true,
			},
			createdAt: calculatedCreatedAt(post),
			tags: [],
			mediaFiles,
		};
	}

	if (post.platform === 'twitter') {
		const mediaFiles = getBlogPostMediaFiles(post, blogMediaFiles) || {};
		const text = replaceLinks(post.text, post.links);
		return {
			platform: 'twitter',
			type: 'regular',
			id: post.id,
			url: post.url,
			body: {
				content: htmlifyText(text),
				isDisabled: false,
				showMediaFiles: true,
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

	const mediaFiles = getBlogPostMediaFiles(post, blogMediaFiles) || {};
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

	const photo = post.type === 'photo' ? { photos } : undefined;
	const video =
		post.type === 'video'
			? {
					caption: post['video-caption'] || post.video_caption || '',
					source: post['video-source'] || post.video_source || '',
				}
			: undefined;

	const bodyIncludesMediaExtensions = allMediaExtensions.some(ext =>
		(rawBody || '').includes('.' + ext)
	);
	const answerIncludesMediaExtensions = allMediaExtensions.some(ext =>
		(post.answer || '').includes('.' + ext)
	);
	const showMediaFiles =
		blogMetadata?.BlogType === getBlogTypeIndex('tumblrsearch') ||
		(!bodyIncludesMediaExtensions &&
			!answerIncludesMediaExtensions &&
			!photo &&
			!video);

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
		photo,
		video,
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
}

export const getCachedProcessedBlogPost = ({
	blog,
	rawPost,
	blogMediaFiles,
}: {
	blog: BlogEntry | undefined;
	rawPost: RawBlogPost;
	blogMediaFiles:
		| {
				imagesByPostId: Map<string, string[]>;
				videosByPostId: Map<string, string[]>;
		  }
		| undefined;
}) => {
	const id = 'id' in rawPost ? rawPost.id : 'unknown-id';
	return cacheValue(
		'BLOG_PROCESSING',
		`processed-blog-post-${blog?.metadata.Name}-${id}`,
		() => {
			const rawPostWithPlatform = {
				...rawPost,
				platform: blog?.metadata.platform || 'unknown',
			} as RawBlogPost;
			const combined = {
				raw: rawPostWithPlatform,
				processed: processBlogPost(
					rawPostWithPlatform,
					blog?.metadata,
					blogMediaFiles
				),
			};
			const stringified = JSON.stringify(combined);
			return {
				...combined,
				stringified,
			} satisfies CombinedBlogPost;
		}
	);
};
