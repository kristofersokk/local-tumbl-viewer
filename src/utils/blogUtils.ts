import { fileExtensions } from 'Constants/file';
import { BlogMetadata, BlogType, CombinedBlogPost, Platform } from 'Types/blog';

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

export const detectBlogMediaFiles = (
	blogFileNames: string[] | undefined,
	blogIds: string[] | undefined
) => {
	const imagesByPostId = new Map<string, string[]>();
	const videosByPostId = new Map<string, string[]>();

	if (!blogFileNames) {
		return {
			imagesByPostId,
			videosByPostId,
		};
	}

	const blogIdLengths: number[] = [];
	if (blogIds) {
		for (const blogId of blogIds) {
			if (!blogIdLengths.includes(blogId.length)) {
				blogIdLengths.push(blogId.length);
			}
		}
	}

	const blogIdsSet = new Set(blogIds || []);

	blogFileNames.forEach(fileName => {
		const lastPoint = fileName.lastIndexOf('.');
		const fileNameWithoutExtension =
			lastPoint !== -1 ? fileName.slice(0, lastPoint) : fileName;
		const extension =
			lastPoint !== -1 ? fileName.slice(lastPoint + 1).toLowerCase() : '';
		const appropriateSet = fileExtensions.image.includes(extension)
			? imagesByPostId
			: fileExtensions.video.includes(extension)
				? videosByPostId
				: null;
		if (appropriateSet) {
			for (const blogIdLength of blogIdLengths) {
				const possibleBlogId = fileNameWithoutExtension.slice(0, blogIdLength);
				if (blogIdsSet.has(possibleBlogId)) {
					if (appropriateSet.has(possibleBlogId)) {
						appropriateSet.get(possibleBlogId)!.push(fileName);
					} else {
						appropriateSet.set(possibleBlogId, [fileName]);
					}
					break;
				}
			}
		}
	});

	return {
		imagesByPostId,
		videosByPostId,
	};
};

export const countAllTags = (
	posts: CombinedBlogPost[]
): { tag: string; count: number }[] => {
	const tagCounts = new Map<string, number>();
	posts.forEach(post => {
		(post.processed.tags || []).forEach(tag => {
			tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
		});
	});
	return Array.from(tagCounts.entries()).map(([tag, count]) => ({
		tag,
		count,
	}));
};

export const filterBlogPostsByFuzzySearch = (
	posts: CombinedBlogPost[],
	searchString: string | undefined
): CombinedBlogPost[] => {
	if (!searchString || searchString.trim() === '') return posts;

	const cleanedSearchString = searchString.trim().toLowerCase();
	const searchStringSegments = cleanedSearchString
		.split(' ')
		.filter(s => s.length > 0);

	return posts.filter(post => {
		const cleanedPostContent = post.stringified.toLowerCase();
		return searchStringSegments.every(segment =>
			cleanedPostContent.includes(segment)
		);
	});
};
